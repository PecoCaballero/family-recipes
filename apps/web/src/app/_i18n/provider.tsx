'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './config';
import { LoadingPage } from '../_scenes/LoadingPage';

const LANGUAGE_STORAGE_KEY = 'language';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    const storedLanguage = sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
      setIsInitialized(true);
    }
  }, []);

  if (!isInitialized) {
    return <LoadingPage />;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
