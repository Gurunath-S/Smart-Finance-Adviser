import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'sfa_auth_token';
const CUSTOM_API_URL_KEY = 'sfa_custom_api_url';

// Resolves default API base URL based on platform
export const getDefaultApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

export const api = axios.create({
  baseURL: getDefaultApiUrl(),
  timeout: 45000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Listener for unauthorized 401 events
type UnauthorizedHandler = () => void;
let onUnauthorizedCallback: UnauthorizedHandler | null = null;

export const setOnUnauthorizedCallback = (callback: UnauthorizedHandler | null) => {
  onUnauthorizedCallback = callback;
};

// Allows dynamic API URL update (e.g. from Profile screen when connecting to a real LAN server)
export const updateApiBaseUrl = async (newUrl: string) => {
  let formatted = newUrl.trim();
  if (formatted.endsWith('/')) {
    formatted = formatted.slice(0, -1);
  }
  if (!formatted.endsWith('/api')) {
    formatted = `${formatted}/api`;
  }
  api.defaults.baseURL = formatted;
  await SecureStore.setItemAsync(CUSTOM_API_URL_KEY, formatted);
};

export const getCustomApiUrl = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(CUSTOM_API_URL_KEY);
  } catch {
    return null;
  }
};

// Initialize custom URL if previously saved
// (async () => {
//   try {
//     const savedUrl = await SecureStore.getItemAsync(CUSTOM_API_URL_KEY);
//     if (savedUrl) {
//       api.defaults.baseURL = savedUrl;
//     }
//   } catch {
//     // Ignore initialization read errors
//   }
// })();

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to read auth token from SecureStore:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-logout on 401 & Rate Limit formatting on 429
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; retryAfterSeconds?: number }>) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch {
        // Ignore deletion errors
      }
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    } else if (error.response?.status === 429) {
      const retrySec = error.response.data?.retryAfterSeconds || error.response.headers['retry-after'] || 60;
      const customMsg = error.response.data?.message || `Too many requests. Please wait ${retrySec} seconds before retrying.`;
      error.message = customMsg;
    }
    return Promise.reject(error);
  }
);
