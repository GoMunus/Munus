import { api } from './api';
import type { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
  role: 'jobseeker' | 'employer';
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  role: 'jobseeker' | 'employer';
  phone?: string;
  location?: string;
  company?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

class AuthService {
  async login(email: string, password: string, role: 'jobseeker' | 'employer'): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password, role });
      const { access_token, refresh_token, user } = response.data;
      
      localStorage.setItem('skillglide-access-token', access_token);
      localStorage.setItem('skillglide-refresh-token', refresh_token);
      localStorage.setItem('skillglide-user', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      const { access_token, refresh_token, user } = response.data;
      
      localStorage.setItem('skillglide-access-token', access_token);
      localStorage.setItem('skillglide-refresh-token', refresh_token);
      localStorage.setItem('skillglide-user', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  }

  logout(): void {
    try {
      localStorage.removeItem('skillglide-access-token');
      localStorage.removeItem('skillglide-refresh-token');
      localStorage.removeItem('skillglide-user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('skillglide-user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  getAccessToken(): string | null {
    try {
      return localStorage.getItem('skillglide-access-token');
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();