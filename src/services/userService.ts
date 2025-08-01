import { api } from './api';
import type { User } from '../types';

class UserService {
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch user profile';
      throw new Error(errorMessage);
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      console.log('UserService: Updating profile with data:', userData);
      const response = await api.put<User>('/users/me', userData);
      console.log('UserService: Profile update successful:', response.data);
      
      // Update stored user data
      const currentUser = localStorage.getItem('skillglide-user');
      if (currentUser) {
        const updatedUser = { ...JSON.parse(currentUser), ...response.data };
        localStorage.setItem('skillglide-user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('UserService: Profile update failed:', error);
      console.error('UserService: Error response:', error.response);
      console.error('UserService: Error data:', error.response?.data);
      
      let errorMessage = 'Failed to update profile';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (Array.isArray(error.response.data)) {
          // Handle validation errors
          errorMessage = error.response.data.map((err: any) => err.msg || err.message || err).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.upload<{ avatar_url: string }>('/upload/avatar', formData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to upload avatar';
      throw new Error(errorMessage);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/users/change-password', { 
        current_password: currentPassword, 
        new_password: newPassword 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to change password';
      throw new Error(errorMessage);
    }
  }
}

export const userService = new UserService();