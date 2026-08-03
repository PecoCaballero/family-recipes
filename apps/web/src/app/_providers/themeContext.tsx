'use client';

import React, { createContext, useContext, useState } from 'react';
import { PaletteMode, useMediaQuery } from '@mui/material';

export type ThemeMode = 'light' | 'dark' | 'auto';

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

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'auto';
  const stored = sessionStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  return 'auto';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [storedMode, setStoredMode] = useState<ThemeMode>(readStoredTheme);

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
    <ThemeContext.Provider value={{ mode, storedMode, setMode }}>{children}</ThemeContext.Provider>
  );
};
