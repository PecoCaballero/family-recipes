import { createTheme, PaletteMode } from '@mui/material/styles';

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    components: {
      MuiInputBase: {
        styleOverrides: {
          input: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          },
        },
      },
    },
    typography: {
      fontFamily: '"Geist", "Helvetica", "Arial", sans-serif',
    },
  });

export const theme = getTheme('light');
