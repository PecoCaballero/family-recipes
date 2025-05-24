import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Geist", "Helvetica", "Arial", sans-serif',
  },
});
