'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PaletteMode, useMediaQuery } from '@mui/material';

type ThemeMode = 'light' | 'dark' | 'auto';

type ThemeContextType = {
  mode: PaletteMode;
  storedMode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [storedMode, setStoredMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const stored = sessionStorage.getItem('theme') as ThemeMode | null;
    if (stored) {
      setStoredMode(stored);
    }
  }, []);

  const getMode = (): PaletteMode => {
    if (storedMode === 'auto') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return storedMode;
  };

  const setMode = (mode: ThemeMode) => {
    setStoredMode(mode);
    sessionStorage.setItem('theme', mode);
  };

  const mode = getMode();

  return (
    <ThemeContext.Provider value={{ mode, storedMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};