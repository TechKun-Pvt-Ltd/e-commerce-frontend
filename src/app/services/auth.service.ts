import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await axios.post<{ token: string }>(`${API_URL}/auth/refresh`, { refreshToken });
    return response.data;
  },

  async getCurrentUser() {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  },

  async updateProfile(data: { name?: string; email?: string; password?: string }) {
    const response = await axios.put(`${API_URL}/auth/profile`, data);
    return response.data;
  },

  async requestPasswordReset(email: string) {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  },
}; 