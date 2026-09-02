import { createTheme } from "@mui/material/styles";

/**
 * Tema base de Material UI (HU-21).
 * Estado: A DEFINIR por el equipo de diseño / desarrollo.
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // A definir
    },
    secondary: {
      main: "#9c27b0", // A definir
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
