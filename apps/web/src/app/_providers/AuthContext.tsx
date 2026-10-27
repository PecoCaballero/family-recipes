'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { User, TokenPair } from '@family-recipe/shared';
import { PpWC } from '@/app/_types/types';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGoogleLoginMutation,
} from '@/app/_hooks/auth';
import i18n from '@/app/_i18n/config';

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (tokens: TokenPair) => void;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function readSessionJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readSessionString(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(key);
}

export function AuthProvider({ children }: PpWC) {
  const [user, setUser] = useState<User | null>(() => readSessionJSON<User | null>('user', null));
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    readSessionString('accessToken'),
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    readSessionString('refreshToken'),
  );

  const { mutateAsync: loginAsync } = useLoginMutation();
  const { mutateAsync: registerAsync } = useRegisterMutation();
  const { mutateAsync: logoutAsync } = useLogoutMutation();
  const { mutateAsync: googleLoginAsync } = useGoogleLoginMutation();

  const persistTokens = useCallback((tokens: TokenPair, userData: User) => {
    sessionStorage.setItem('accessToken', tokens.accessToken);
    sessionStorage.setItem('refreshToken', tokens.refreshToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('language', userData.settings.language);
    if (userData.settings.language !== i18n.language) {
      i18n.changeLanguage(userData.settings.language);
    }
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUser(userData);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginAsync({ email, password });
      persistTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user);
    },
    [loginAsync, persistTokens],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await registerAsync({ name, email, password });
      persistTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user);
    },
    [registerAsync, persistTokens],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const data = await googleLoginAsync({ idToken });
      persistTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user);
    },
    [googleLoginAsync, persistTokens],
  );

  const logout = useCallback(async () => {
    if (refreshToken) {
      try {
        await logoutAsync({ refreshToken });
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
  }, [refreshToken, logoutAsync]);

  const setTokensValue = useCallback((tokens: TokenPair) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
  }, []);

  const setUserValue = useCallback((userData: User) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user && !!accessToken,
        login,
        loginWithGoogle,
        register,
        logout,
        setTokens: setTokensValue,
        setUser: setUserValue,
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
