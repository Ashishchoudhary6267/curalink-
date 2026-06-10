/* eslint-disable react-refresh/unless-used */
/* eslint-disable react-refresh/export-components */
import { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize user from localStorage on mount
  useCallback(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/login`, {
        email,
        password,
      });

      if (response.data.success) {
        // Store token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: response.data.error || 'Login failed' };
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg =
        error.response?.data?.error || 'Failed to connect to backend. Is the server running?';
      return { success: false, error: errorMsg };
    }
  };

  const signup = async (email, password, confirmPassword) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/signup`, {
        email,
        password,
        confirmPassword,
      });

      if (response.data.success) {
        // Account created successfully - do NOT auto-login
        // User must manually sign in with their credentials
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: response.data.error || 'Signup failed' };
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg =
        error.response?.data?.error || 'Failed to connect to backend. Is the server running?';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const loadUserFromStorage = useCallback(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        signup,
        logout,
        isLoading,
        loadUserFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
