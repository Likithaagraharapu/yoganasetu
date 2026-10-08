'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginData, SignupData } from '@/lib/types';
import { loginUser, signupUser, getCurrentUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<User>;
  signup: (data: SignupData) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'ys_auth_token';
const USER_KEY = 'ys_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state from persistent storage
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        if (typeof window === 'undefined') return;

        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken) {
          setToken(storedToken);

          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              // ignore json parse error
            }
          }

          // Verify token against backend API
          try {
            const verifiedUser = await getCurrentUser(storedToken);
            if (isMounted) {
              setUser(verifiedUser);
              localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser));
            }
          } catch (verifyErr) {
            console.warn('Session expired or invalid, clearing local session:', verifyErr);
            if (isMounted) {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (data: LoginData): Promise<User> => {
    setLoading(true);
    try {
      const res = await loginUser(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      }
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupData): Promise<User> => {
    setLoading(true);
    try {
      const res = await signupUser(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      }
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);
    if (!activeToken) return;

    try {
      const freshUser = await getCurrentUser(activeToken);
      setUser(freshUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      }
    } catch {
      logout();
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
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
