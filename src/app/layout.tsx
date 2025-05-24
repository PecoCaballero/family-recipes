import React from "react";
import { Inter } from "next/font/google";
import { ThemeProviderComponent } from "@/app/_providers/themeProvider";
import { PpWC } from "@/app/_types/types";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: 'Family Recipe',
    template: '%s | Family Recipe',
  },
};

export default function RootLayout({
  children,
}: PpWC) {
  return (
    <html lang="en">
      <body
        className={`${interSans.variable} antialiased`}
      >
        <ThemeProviderComponent>
          {children}
        </ThemeProviderComponent>
      </body>
    </html>
  );
}
