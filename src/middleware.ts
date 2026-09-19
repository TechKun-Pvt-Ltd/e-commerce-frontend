import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) {
      b64 += '=';
    }
    const payload = JSON.parse(atob(b64));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  const isAuthenticated = Boolean(token && !isTokenExpired(token));
  const isAdmin = userRole === 'ADMIN' || userRole === 'PLATFORM_ADMIN';

  // 1. Dedicated Admin Login handling
  if (pathname === '/admin/login') {
    if (isAuthenticated && isAdmin) {
      return NextResponse.redirect(new URL('/admin/products', request.url));
    }
    return NextResponse.next();
  }

  // 2. Guard all /admin routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!isAuthenticated) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(adminLoginUrl);
      if (token) {
        response.cookies.delete('token');
        response.cookies.delete('refresh_token');
        response.cookies.delete('user_role');
      }
      return response;
    }

    if (!isAdmin) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  // 3. Guard all /account routes
  if (pathname === '/account' || pathname.startsWith('/account/')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        response.cookies.delete('token');
        response.cookies.delete('refresh_token');
        response.cookies.delete('user_role');
      }
      return response;
    }
  }

  // 4. Guard all /checkout routes
  if (pathname === '/checkout' || pathname.startsWith('/checkout/')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        response.cookies.delete('token');
        response.cookies.delete('refresh_token');
        response.cookies.delete('user_role');
      }
      return response;
    }
  }

  // 5. Add auth headers for API routes to enable server-side token refresh
  const response = NextResponse.next();

  // Pass token info to downstream API routes via headers
  if (token) {
    response.headers.set('x-auth-token', token);
    if (refreshToken) {
      response.headers.set('x-refresh-token', refreshToken);
    }
    if (userRole) {
      response.headers.set('x-user-role', userRole);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/account',
    '/account/:path*',
    '/checkout',
    '/checkout/:path*',
  ],
};