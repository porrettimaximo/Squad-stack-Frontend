import { createTheme } from "@mui/material/styles";

/**
 * Tema unificado de Material UI (HU-21 / HU-30).
 * Sigue la paleta y estética oficial del grupo DigitalArs:
 * - Primario: #0056D2 (Azul Real)
 * - Secundario: #02122c (Navy Dark)
 * - Fondo: #F8FAFC
 * - Éxito: #10B981 | Error: #EF4444 | Advertencia: #F59E0B | Info: #38B6FF
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0056D2",
      dark: "#0047B3",
      light: "#EFF6FF",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#02122c",
      dark: "#000B1A",
      light: "#1E293B",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    success: {
      main: "#10B981",
      light: "#ECFDF5",
      dark: "#059669",
    },
    error: {
      main: "#EF4444",
      light: "#FEF2F2",
      dark: "#DC2626",
    },
    warning: {
      main: "#F59E0B",
      light: "#FFFBEB",
      dark: "#D97706",
    },
    info: {
      main: "#0284C7",
      light: "#F0F9FF",
      dark: "#0369A1",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      '"Helvetica Neue"',
      "sans-serif",
    ].join(","),
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 20px",
          fontSize: "0.95rem",
          fontWeight: 600,
          boxShadow: "none",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:focus-visible": {
            outline: "2px solid #0056D2",
            outlineOffset: "2px",
          },
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 86, 210, 0.15)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #0056D2 0%, #0066FF 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #0047B3 0%, #0056D2 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(0, 22, 57, 0.04)",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
          "& fieldset": {
            borderColor: "#E2E8F0",
            transition: "border-color 0.2s ease, border-width 0.2s ease",
          },
          "&:hover fieldset": {
            borderColor: "#94A3B8",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#0056D2",
            borderWidth: "2px",
          },
          "& input": {
            outline: "none !important",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#F1F5F9",
          padding: "14px 16px",
        },
        head: {
          fontWeight: 700,
          color: "#475569",
          backgroundColor: "#F8FAFC",
        },
      },
    },
  },
});

export default theme;

