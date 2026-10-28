'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';
import ptTranslations from './locales/pt.json';

export type LocaleDefinition = {
  code: string;
  label: string;
  translations: typeof enTranslations;
};

export const LOCALES: LocaleDefinition[] = [
  { code: 'en', label: 'English', translations: enTranslations },
  { code: 'es', label: 'Español', translations: esTranslations },
  { code: 'fr', label: 'Français', translations: frTranslations },
  { code: 'de', label: 'Deutsch', translations: deTranslations },
  { code: 'pt', label: 'Português', translations: ptTranslations },
];

const resources = LOCALES.reduce<Record<string, { translation: typeof enTranslations }>>(
  (acc, { code, translations }) => ({ ...acc, [code]: { translation: translations } }),
  {},
);

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
