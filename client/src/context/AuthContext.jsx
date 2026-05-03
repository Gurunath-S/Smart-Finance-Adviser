import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback((msg = "Session expired. Please log in again.") => {
    if (msg) toast.info(msg);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  }, []);

  const checkTokenExpiry = useCallback((t) => {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        logout();
        return false;
      }
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      if (checkTokenExpiry(token)) {
        // Here you could fetch user profile if needed
        setUser({ username: localStorage.getItem('username') });
      }
    }
    setLoading(false);
  }, [token, checkTokenExpiry]);

  // Axios interceptor for 401s
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  const login = (newToken, username) => {
    setToken(newToken);
    setUser({ username });
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
