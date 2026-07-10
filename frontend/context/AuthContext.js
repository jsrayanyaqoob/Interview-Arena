'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { parseApiError } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Helper to set auth cookie (for middleware)
  const setAuthCookie = useCallback((token, maxAgeDays = 30) => {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `token=${token}; path=/; max-age=${maxAgeDays * 24 * 60 * 60}; SameSite=Lax${secure}`;
  }, []);

  const clearAuthCookie = useCallback(() => {
    document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthCookie(token);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        clearAuthCookie();
      }
    }
    setLoading(false);
  }, [setAuthCookie, clearAuthCookie]);

  // Login
  const login = useCallback(async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password, rememberMe });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthCookie(data.token, rememberMe ? 30 : 7);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = parseApiError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [setAuthCookie]);

  // Register
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthCookie(data.token, 7);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = parseApiError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [setAuthCookie]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    clearAuthCookie();
    setUser(null);
    router.push('/sign-in');
  }, [router, clearAuthCookie]);

  // Fetch current user profile
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return null;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isCandidate: user?.role === 'CANDIDATE',
    isRecruiter: user?.role === 'RECRUITER',
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
