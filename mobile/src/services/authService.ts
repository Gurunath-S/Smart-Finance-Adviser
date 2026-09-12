import { api } from './api';
import * as SecureStore from 'expo-secure-store';
import { AuthResponse, User } from '../types';

const TOKEN_KEY = 'sfa_auth_token';
const USER_KEY = 'sfa_auth_user';

export const authService = {
  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data;
  },

  async login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      username: usernameOrEmail.trim(),
      password,
    });
    return response.data;
  },

  async saveSession(token: string, user: User): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const data = await SecureStore.getItemAsync(USER_KEY);
      return data ? (JSON.parse(data) as User) : null;
    } catch {
      return null;
    }
  },

  async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch {
      // Ignore deletion errors
    }
  },
};
