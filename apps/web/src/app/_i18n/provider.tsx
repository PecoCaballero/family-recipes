'use client';

import { useLayoutEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './config';
import { PpWC } from '@/app/_types/types';

function detectPersistedLanguage(): string | null {
  if (typeof window === 'undefined') return null;

  // Try dedicated language key first (set on manual change or login)
  const langKey = sessionStorage.getItem('language');
  if (langKey && ['en', 'es', 'fr', 'de', 'pt'].includes(langKey)) return langKey;

  // Fall back to user settings from persisted user object
  try {
    const userRaw = sessionStorage.getItem('user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      const userLang = user?.settings?.language;
      if (userLang && ['en', 'es', 'fr', 'de', 'pt'].includes(userLang)) return userLang;
    }
  } catch {
    // ignore parse errors
  }

  return null;
}

export function I18nProvider({ children }: PpWC) {
  useLayoutEffect(() => {
    const lang = detectPersistedLanguage();
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
