import { createTheme } from "@mui/material/styles";

/**
 * Tema unificado de Material UI (HU-21 / HU-30) con soporte Claro y Oscuro.
 */
export const getAppTheme = (mode = "light") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
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
        default: isDark ? "#0A0F1D" : "#F8FAFC",
        paper: isDark ? "#131C2E" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#F1F5F9" : "#0F172A",
        secondary: isDark ? "#94A3B8" : "#64748B",
      },
      action: {
        hover: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
        selected: isDark ? "rgba(0, 86, 210, 0.2)" : "rgba(0, 86, 210, 0.08)",
      },
      success: {
        main: "#10B981",
        light: isDark ? "#064E3B" : "#ECFDF5",
        dark: "#059669",
      },
      error: {
        main: "#EF4444",
        light: isDark ? "#7F1D1D" : "#FEF2F2",
        dark: "#DC2626",
      },
      warning: {
        main: "#F59E0B",
        light: isDark ? "#78350F" : "#FFFBEB",
        dark: "#D97706",
      },
      info: {
        main: "#0284C7",
        light: isDark ? "#0C4A6E" : "#F0F9FF",
        dark: "#0369A1",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
    },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#0A0F1D" : "#F8FAFC",
            color: isDark ? "#F1F5F9" : "#0F172A",
          },
          ...(isDark && {
            /* Reglas globales en dark mode para unificar contenedores con fondos fijos */
            ".dark-theme": {
              colorScheme: "dark",
            },
            /* Evitar textos oscuros ilegibles sobre fondo oscuro */
            "[data-theme='dark']": {
              colorScheme: "dark",
            },
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "8px 20px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
          containedPrimary: {
            backgroundColor: "#0056D2",
            "&:hover": {
              backgroundColor: "#0047B3",
            },
          },
          outlinedPrimary: {
            borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "#E2E8F0",
            color: isDark ? "#60A5FA" : "#0056D2",
            "&:hover": {
              borderColor: "#0056D2",
              backgroundColor: isDark ? "rgba(0, 86, 210, 0.18)" : "#EFF6FF",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
            boxShadow: isDark
              ? "0 4px 20px rgba(0, 0, 0, 0.45)"
              : "0 4px 20px rgba(0, 22, 57, 0.04)",
            backgroundImage: "none",
            backgroundColor: isDark ? "#131C2E" : "#FFFFFF",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 16,
          },
          root: {
            backgroundImage: "none",
            backgroundColor: isDark ? "#131C2E" : "#FFFFFF",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark ? "#1A263B" : "#FFFFFF",
            "& fieldset": {
              borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#E2E8F0",
              transition: "border-color 0.2s ease, border-width 0.2s ease",
            },
            "&:hover fieldset": {
              borderColor: isDark ? "rgba(255, 255, 255, 0.28)" : "#94A3B8",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#38BDF8",
              borderWidth: "2px",
            },
            "& input": {
              outline: "none !important",
              color: isDark ? "#F8FAFC" : "#0F172A",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#F1F5F9",
            padding: "14px 16px",
            color: isDark ? "#CBD5E1" : "inherit",
          },
          head: {
            fontWeight: 700,
            color: isDark ? "#E2E8F0" : "#475569",
            backgroundColor: isDark ? "#1A263B" : "#F8FAFC",
            borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #E2E8F0",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? "#131C2E" : "#FFFFFF",
            backgroundImage: "none",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? "#131C2E" : "#FFFFFF",
            backgroundImage: "none",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0",
          },
        },
      },
    },
  });
};

export const theme = getAppTheme("light");
export default theme;
