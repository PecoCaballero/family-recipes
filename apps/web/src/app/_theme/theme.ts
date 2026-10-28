import { createTheme, type Theme, type PaletteMode } from '@mui/material/styles';
import { MIN_TOUCH_TARGET, brand, radius, surfaces, typography } from './tokens';

export const getTheme = (mode: PaletteMode): Theme => {
  const surface = surfaces[mode];
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? brand.green : brand.greenDark,
        light: brand.green,
        dark: brand.greenDarker,
        contrastText: isDark ? '#052E16' : '#FFFFFF',
      },
      secondary: {
        main: brand.greenDarker,
      },
      background: {
        default: surface.background,
        paper: surface.paper,
      },
      divider: surface.divider,
    },
    shape: {
      borderRadius: radius.md,
    },
    typography: {
      fontFamily: typography.fontFamily,
      fontSize: typography.baseFontSize,
      h1: { fontSize: '2rem', fontWeight: 600 },
      h2: { fontSize: '1.75rem', fontWeight: 600 },
      h3: { fontSize: '1.5rem', fontWeight: 600 },
      h4: { fontSize: '1.375rem', fontWeight: 600 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontSize: '1.125rem', fontWeight: 600 },
      body1: { fontSize: '1.0625rem' },
      body2: { fontSize: '0.9375rem' },
      button: { textTransform: 'none', fontWeight: 600, fontSize: '1rem' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          ':focus-visible': {
            outline: `2px solid ${isDark ? brand.green : brand.greenDark}`,
            outlineOffset: 2,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: MIN_TOUCH_TARGET,
            borderRadius: radius.full,
            paddingInline: 20,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            minWidth: MIN_TOUCH_TARGET,
            minHeight: MIN_TOUCH_TARGET,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            minHeight: 56,
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            minWidth: 56,
            minHeight: 56,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radius.lg,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minHeight: 64,
          },
          label: {
            fontSize: '0.8125rem',
          },
        },
      },
    },
  });
};

export const theme = getTheme('light');
