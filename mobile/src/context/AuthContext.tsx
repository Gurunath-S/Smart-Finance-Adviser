import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { setOnUnauthorizedCallback } from '../services/api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserAvatar: (newImageUrl: string) => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  updateUserAvatar: () => {},
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    await authService.clearSession();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const storedToken = await authService.getStoredToken();
        const storedUser = await authService.getStoredUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (e) {
        console.warn('Failed to restore auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapSession();

    // Register 401 callback to auto-logout
    setOnUnauthorizedCallback(() => {
      logout();
    });

    return () => {
      setOnUnauthorizedCallback(null);
    };
  }, [logout]);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await authService.login(usernameOrEmail, password);
      setToken(response.token);
      setUser(response.user);
      await authService.saveSession(response.token, response.user);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await authService.signup(username, email, password);
      setToken(response.token);
      setUser(response.user);
      await authService.saveSession(response.token, response.user);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(msg);
      return false;
    }
  };

  const updateUserAvatar = (newImageUrl: string) => {
    if (user) {
      const updated = { ...user, profileImage: newImageUrl };
      setUser(updated);
      if (token) {
        authService.saveSession(token, updated);
      }
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        error,
        login,
        signup,
        logout,
        updateUserAvatar,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
