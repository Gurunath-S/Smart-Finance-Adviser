import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { setOnUnauthorizedCallback } from '../services/api';
import { biometricService } from '../services/biometricService';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isBiometricsAvailable: boolean;
  isBiometricsEnrolled: boolean;
  isBiometricsEnabled: boolean;
  biometricType: string;
  savedBiometricUser: User | null;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  loginWithBiometrics: () => Promise<boolean>;
  toggleBiometrics: (enable: boolean) => Promise<boolean>;
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
  isBiometricsAvailable: false,
  isBiometricsEnrolled: false,
  isBiometricsEnabled: false,
  biometricType: 'Biometrics',
  savedBiometricUser: null,
  login: async () => false,
  loginWithGoogle: async () => false,
  loginWithBiometrics: async () => false,
  toggleBiometrics: async () => false,
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

  // Biometrics state
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState<boolean>(false);
  const [isBiometricsEnrolled, setIsBiometricsEnrolled] = useState<boolean>(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>('Biometrics');
  const [savedBiometricUser, setSavedBiometricUser] = useState<User | null>(null);

  const logout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        // 1. Initialize biometric status and check for saved biometric credentials
        const bioStatus = await biometricService.checkBiometricStatus();
        setIsBiometricsAvailable(bioStatus.available);
        setIsBiometricsEnrolled(bioStatus.enrolled);
        setBiometricType(bioStatus.biometricType);

        const savedBio = await biometricService.getSavedBiometricSession();
        if (savedBio) {
          setSavedBiometricUser(savedBio.user);
          setIsBiometricsEnabled(true);
        } else {
          const isBioEnabled = await biometricService.isBiometricsEnabled();
          setIsBiometricsEnabled(isBioEnabled);
        }

        // 2. Restore active session if present
        const storedToken = await authService.getStoredToken();
        const storedUser = await authService.getStoredUser();

        if (storedToken) {
          setToken(storedToken);
          setUser(storedUser);

          // Asynchronously refresh latest user profile from /auth/me
          authService.getCurrentUser().then((freshUser) => {
            if (freshUser) {
              setUser(freshUser);
            }
          }).catch(() => {});
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

      // Auto-save biometric session if biometric hardware is present
      const bioStatus = await biometricService.checkBiometricStatus();
      if (bioStatus.available) {
        await biometricService.saveBiometricSession(response.token, response.user);
        setSavedBiometricUser(response.user);
        setIsBiometricsEnabled(true);
      }

      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
      return false;
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await authService.loginWithGoogle(idToken);
      setToken(response.token);
      setUser(response.user);
      await authService.saveSession(response.token, response.user);

      // Auto-save biometric session if biometric hardware is present
      const bioStatus = await biometricService.checkBiometricStatus();
      if (bioStatus.available) {
        await biometricService.saveBiometricSession(response.token, response.user);
        setSavedBiometricUser(response.user);
        setIsBiometricsEnabled(true);
      }

      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Google Sign-In failed. Please try again.';
      setError(msg);
      return false;
    }
  };

  const loginWithBiometrics = async (): Promise<boolean> => {
    setError(null);
    try {
      const bioSession = await biometricService.getSavedBiometricSession();
      if (!bioSession) {
        setError('No saved biometric session found. Please sign in with your credentials once.');
        return false;
      }

      const promptMsg = `Unlock Smart Finance Adviser with ${biometricType}`;
      const authResult = await biometricService.authenticate(promptMsg);
      if (!authResult.success) {
        if (authResult.error && authResult.error !== 'Authentication cancelled') {
          setError(authResult.error);
        }
        return false;
      }

      setToken(bioSession.token);
      setUser(bioSession.user);
      await authService.saveSession(bioSession.token, bioSession.user);

      // Refresh latest user profile in background
      authService.getCurrentUser().then((freshUser) => {
        if (freshUser) {
          setUser(freshUser);
        }
      }).catch(() => {});

      return true;
    } catch (err: any) {
      setError(err?.message || 'Biometric authentication failed.');
      return false;
    }
  };

  const toggleBiometrics = async (enable: boolean): Promise<boolean> => {
    try {
      if (enable) {
        const prompt = `Authorize ${biometricType} for Smart Finance Adviser`;
        const authResult = await biometricService.authenticate(prompt);
        if (!authResult.success) {
          return false;
        }
        if (token && user) {
          await biometricService.saveBiometricSession(token, user);
          setSavedBiometricUser(user);
        }
      }
      await biometricService.setBiometricsEnabled(enable);
      setIsBiometricsEnabled(enable);
      return true;
    } catch {
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

      const bioStatus = await biometricService.checkBiometricStatus();
      if (bioStatus.available) {
        await biometricService.saveBiometricSession(response.token, response.user);
        setSavedBiometricUser(response.user);
        setIsBiometricsEnabled(true);
      }

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
        isBiometricsAvailable,
        isBiometricsEnrolled,
        isBiometricsEnabled,
        biometricType,
        savedBiometricUser,
        login,
        loginWithGoogle,
        loginWithBiometrics,
        toggleBiometrics,
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
