import React from 'react';
import { Inter } from 'next/font/google';
import { ThemeProviderComponent } from '@/app/_providers/themeProvider';
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
        <I18nProvider>
          <ThemeProviderComponent>{children}</ThemeProviderComponent>
        </I18nProvider>
      </body>
    </html>
  );
}
