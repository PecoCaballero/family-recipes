'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, TokenPair } from '@family-recipe/shared';
import { PpWC } from '@/app/_types/types';
import { useLoginMutation, useRegisterMutation, useLogoutMutation } from '@/app/_hooks/auth';

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (tokens: TokenPair) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PpWC) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    const storedAccess = sessionStorage.getItem('accessToken');
    const storedRefresh = sessionStorage.getItem('refreshToken');
    const storedUser = sessionStorage.getItem('user');

    if (storedAccess && storedRefresh && storedUser) {
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const persistTokens = useCallback((tokens: TokenPair, userData: User) => {
    sessionStorage.setItem('accessToken', tokens.accessToken);
    sessionStorage.setItem('refreshToken', tokens.refreshToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUser(userData);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginMutation.mutateAsync({ email, password });
      persistTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user);
    },
    [loginMutation.mutateAsync, persistTokens],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await registerMutation.mutateAsync({ name, email, password });
      persistTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user);
    },
    [registerMutation.mutateAsync, persistTokens],
  );

  const logout = useCallback(async () => {
    if (refreshToken) {
      try {
        await logoutMutation.mutateAsync({ refreshToken });
      } catch {
        // Ignore logout API errors
      }
    }

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, [refreshToken, logoutMutation.mutateAsync]);

  const setTokensValue = useCallback((tokens: TokenPair) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        register,
        logout,
        setTokens: setTokensValue,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('accessToken');
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('refreshToken');
}
