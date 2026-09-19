import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import servicesApiClient from '@/lib/services-api-client';
import type { ServiceFunction } from '@/types/api';
import type { LoginPayload, TokenPayload, UserEssentials } from '@/types/domains/auth';

const AUTH_COOKIE_NAME = 'token';
const ROLE_COOKIE_NAME = 'user_role';
const REFRESH_COOKIE_NAME = 'refresh_token';

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: number;
  user: UserEssentials;
}

class UnifiedAuthService {
  private static instance: UnifiedAuthService;
  private isRefreshing = false;
  private refreshPromise: Promise<RefreshTokenResponse | null> | null = null;

  private constructor() {}

  static getInstance(): UnifiedAuthService {
    if (!UnifiedAuthService.instance) {
      UnifiedAuthService.instance = new UnifiedAuthService();
    }
    return UnifiedAuthService.instance;
  }

  private async setAuthCookies(
    token: string,
    refreshToken: string,
    expiresAt: number,
    userRole?: string
  ) {
    const cookieStore = await cookies();
    const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    const refreshMaxAge = 60 * 60 * 24 * 30; // 30 days

    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    cookieStore.set({
      name: REFRESH_COOKIE_NAME,
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshMaxAge,
      path: '/',
    });

    if (userRole) {
      cookieStore.set({
        name: ROLE_COOKIE_NAME,
        value: userRole,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      });
    }
  }

  private async clearAuthCookies() {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
    cookieStore.delete(ROLE_COOKIE_NAME);
  }

  async login(payload: LoginPayload): Promise<TokenPayload> {
    const response = await fetch(`${process.env.SERVER_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();

    await this.setAuthCookies(
      data.token,
      data.refreshToken,
      data.expiresAt,
      data.user?.roleName
    );

    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${process.env.SERVER_URL}/auth/logout`, { method: 'POST' });
    } catch {
      // Ignore logout errors
    } finally {
      await this.clearAuthCookies();
    }
  }

  async getMe(): Promise<UserEssentials> {
    const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await servicesApiClient.get<UserEssentials>('/auth/me');
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to get user');
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        await this.refreshToken();
        return this.getMe(); // Retry once after refresh
      }
      throw error;
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = (await cookies()).get(REFRESH_COOKIE_NAME)?.value;

    if (!refreshToken) {
      await this.clearAuthCookies();
      return null;
    }

    this.isRefreshing = true;

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${process.env.SERVER_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          await this.clearAuthCookies();
          return null;
        }

        const data = await response.json();

        await this.setAuthCookies(
          data.token,
          data.refreshToken,
          data.expiresAt,
          data.user?.roleName
        );

        return data;
      } catch {
        await this.clearAuthCookies();
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async getValidToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

    if (!token && !refreshToken) {
      return null;
    }

    if (token && !this.isTokenExpired(token)) {
      return token;
    }

    if (refreshToken) {
      const refreshed = await this.refreshToken();
      return refreshed?.token ?? null;
    }

    return null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';

      const payload = JSON.parse(atob(b64));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return true;
      }
      return false;
    } catch {
      return true;
    }
  }

  async requireAuth(): Promise<{ token: string; user: UserEssentials }> {
    const token = await this.getValidToken();

    if (!token) {
      redirect('/auth/login');
    }

    const user = await this.getMe();
    return { token, user };
  }

  async requireAdmin(): Promise<{ token: string; user: UserEssentials }> {
    const { token, user } = await this.requireAuth();

    if (user.roleName !== 'ADMIN' && user.roleName !== 'PLATFORM_ADMIN') {
      redirect('/admin/login');
    }

    return { token, user };
  }
}

export const unifiedAuth = UnifiedAuthService.getInstance();

// Service functions for useDataFetch hook
export const login: ServiceFunction<LoginPayload, TokenPayload> = async (payload) => {
  try {
    const data = await unifiedAuth.login(payload);
    return { data, success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
  }
};

export const logout: ServiceFunction<[], string> = async () => {
  try {
    await unifiedAuth.logout();
    return { data: 'Logout Successful!', success: true };
  } catch {
    return { success: false, error: 'Logout Failed!' };
  }
};

export const me: ServiceFunction<[], UserEssentials> = async () => {
  try {
    const data = await unifiedAuth.getMe();
    return { data, success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to get user' };
  }
};

export const refreshToken: ServiceFunction<[], RefreshTokenResponse> = async () => {
  try {
    const data = await unifiedAuth.refreshToken();
    if (data) {
      return { data, success: true };
    }
    return { success: false, error: 'Token refresh failed' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Token refresh failed' };
  }
};