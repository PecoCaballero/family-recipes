import React from 'react';
import { Inter } from 'next/font/google';
import { ThemeProviderComponent } from '@/app/_providers/themeProvider';
import { AuthProvider } from '@/app/_providers/AuthContext';
import { QueryProvider } from '@/app/_providers/QueryProvider';
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
};

export default function RootLayout({ children }: PpWC) {
  return (
    <html lang="en">
      <body className={`${interSans.variable} antialiased`}>
        <QueryProvider>
          <I18nProvider>
            <ThemeProviderComponent>
              <AuthProvider>{children}</AuthProvider>
            </ThemeProviderComponent>
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
