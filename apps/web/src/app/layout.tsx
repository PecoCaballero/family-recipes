import React from 'react';
import { Inter } from 'next/font/google';
import { ThemeProviderComponent } from '@/app/_providers/themeProvider';
import { AuthProvider } from '@/app/_providers/AuthContext';
import { QueryProvider } from '@/app/_providers/QueryProvider';
import { ToastProvider } from '@/app/_providers/ToastProvider';
import { I18nProvider } from '@/app/_i18n/provider';
import '@/app/_i18n/config';
import { PpWC } from '@/app/_types/types';

const interSans = Inter({
  variable: '--font-inter-sans',
  subsets: ['latin'],
});

export const metadata = {
  title: {
    default: 'Family Recipe',
    template: '%s | Family Recipe',
  },
  description: 'Share and collect recipes with your family.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export const viewport = {
  themeColor: '#075E54',
};

export default function RootLayout({ children }: PpWC) {
  return (
    <html lang="en">
      <body className={interSans.variable}>
        <QueryProvider>
          <I18nProvider>
            <ThemeProviderComponent>
              <AuthProvider>
                <ToastProvider>{children}</ToastProvider>
              </AuthProvider>
            </ThemeProviderComponent>
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
