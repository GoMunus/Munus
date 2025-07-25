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
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: 'jobseeker' | 'employer') => {
    console.log('🔐 AuthContext login called', { email, role });
    setLoading(true);
    try {
      const response = await authService.login(email, password, role);
      console.log('✅ Login response received', { user: response.user });
      setUser(response.user);
      // Force a refresh to ensure the state is properly updated
      setTimeout(() => {
        const storedUser = authService.getCurrentUser();
        console.log('🔄 Refreshing user state', { storedUser });
        if (storedUser) {
          setUser(storedUser);
        }
      }, 100);
    } catch (error) {
      console.error('❌ Login error:', error);
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
      // Force a refresh to ensure the state is properly updated
      setTimeout(() => {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }, 100);
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
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      logout();
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