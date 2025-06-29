import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, type LoginRequest, type RegisterRequest } from '../services/authService';
import { userService } from '../services/userService';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, role: 'jobseeker' | 'employer') => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  isJobSeeker: boolean;
  isEmployer: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getAccessToken();
        if (token) {
          // Try to get fresh user data from API
          try {
            const userData = await userService.getCurrentUser();
            setUser(userData);
          } catch (error) {
            // If API call fails, fallback to stored user data
            const storedUser = authService.getCurrentUser();
            if (storedUser) {
              setUser(storedUser);
            } else {
              // Clear invalid tokens
              authService.logout();
            }
          }
        } else {
          // Fallback to stored user data
          const storedUser = authService.getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid tokens
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: 'jobseeker' | 'employer') => {
    setLoading(true);
    try {
      const response = await authService.login(email, password, role);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    try {
      authService.logout();
      setUser(null);
      // Force page reload to clear any cached data
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, check if we still have stored user data
      const storedUser = authService.getCurrentUser();
      if (!storedUser) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        refreshUser,
        loading,
        isAuthenticated: !!user,
        isJobSeeker: user?.role === 'jobseeker',
        isEmployer: user?.role === 'employer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};