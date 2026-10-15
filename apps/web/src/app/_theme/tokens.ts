import type { PaletteMode } from '@mui/material';

/**
 * Single source of design tokens for the Family Recipe web app.
 * The MUI theme is derived from these in `theme.ts`; components should read
 * tokens via the theme rather than hardcoding values.
 */

/** Minimum interactive height for primary actions (older-user friendly). */
export const MIN_TOUCH_TARGET = 48;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

/** WhatsApp-derived brand greens. */
export const brand = {
  /** Bright accent (send / active). */
  green: '#25D366',
  /** Primary teal-green used for actions and headers. */
  greenDark: '#128C7E',
  /** Deepest green used for header bars. */
  greenDarker: '#075E54',
} as const;

export type SurfaceTokens = {
  header: string;
  headerText: string;
  background: string;
  paper: string;
  divider: string;
};

export const surfaces: Record<PaletteMode, SurfaceTokens> = {
  light: {
    header: brand.greenDarker,
    headerText: '#FFFFFF',
    background: '#ECE5DD',
    paper: '#FFFFFF',
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  dark: {
    header: '#1F2C34',
    headerText: '#E9EDEF',
    background: '#0B141A',
    paper: '#111B21',
    divider: 'rgba(233, 237, 239, 0.12)',
  },
};

export const typography = {
  fontFamily: 'var(--font-inter-sans), "Helvetica", "Arial", sans-serif',
  /** Base body font size in px — enlarged for older users. */
  baseFontSize: 17,
} as const;
