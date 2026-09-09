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
        main: isDark ? "#3B82F6" : "#0056D2",
        dark: isDark ? "#1D4ED8" : "#0047B3",
        light: isDark ? "rgba(59, 130, 246, 0.18)" : "#EFF6FF",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: isDark ? "#38BDF8" : "#02122c",
        dark: isDark ? "#0284C7" : "#000B1A",
        light: isDark ? "#1E293B" : "#F1F5F9",
        contrastText: "#FFFFFF",
      },
      background: {
        default: isDark ? "#0A0F1D" : "#F8FAFC",
        paper: isDark ? "#131C2E" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#F8FAFC" : "#0F172A",
        secondary: isDark ? "#94A3B8" : "#64748B",
      },
      action: {
        hover: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
        selected: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(0, 86, 210, 0.08)",
      },
      success: {
        main: isDark ? "#34D399" : "#10B981",
        light: isDark ? "rgba(16, 185, 129, 0.18)" : "#ECFDF5",
        dark: isDark ? "#059669" : "#047857",
        contrastText: "#FFFFFF",
      },
      error: {
        main: isDark ? "#F87171" : "#EF4444",
        light: isDark ? "rgba(239, 68, 68, 0.18)" : "#FEF2F2",
        dark: "#DC2626",
        contrastText: "#FFFFFF",
      },
      warning: {
        main: isDark ? "#FBBF24" : "#F59E0B",
        light: isDark ? "rgba(245, 158, 11, 0.18)" : "#FFFBEB",
        dark: "#D97706",
        contrastText: "#0F172A",
      },
      info: {
        main: isDark ? "#38BDF8" : "#0284C7",
        light: isDark ? "rgba(2, 132, 199, 0.18)" : "#F0F9FF",
        dark: "#0369A1",
        contrastText: "#FFFFFF",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.12)" : "#E2E8F0",
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
      MuiAlert: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            borderRadius: 14,
            fontWeight: 600,
            fontSize: "0.88rem",
            alignItems: "center",
            boxShadow: isDark
              ? "0 10px 30px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08)"
              : "0 4px 16px rgba(0, 22, 57, 0.08)",
            border: "1px solid",
            backdropFilter: "blur(8px)",
            "& .MuiAlert-message": {
              fontWeight: 600,
              fontSize: "0.88rem",
            },
            "& .MuiAlert-action": {
              paddingTop: 0,
              alignItems: "center",
              "& .MuiIconButton-root": {
                color: "inherit",
                opacity: 0.8,
                "&:hover": { opacity: 1 },
              },
            },
            ...(ownerState?.severity === "success" && {
              backgroundColor: isDark ? "#0D2818 !important" : "#F0FDF4 !important",
              color: isDark ? "#4ADE80 !important" : "#166534 !important",
              borderColor: isDark ? "rgba(74, 222, 128, 0.4) !important" : "#BBF7D0 !important",
              "& .MuiAlert-icon": {
                color: isDark ? "#4ADE80 !important" : "#16A34A !important",
              },
              "& .MuiAlert-message": {
                color: isDark ? "#E6FBF0 !important" : "#166534 !important",
              },
            }),
            ...(ownerState?.severity === "error" && {
              backgroundColor: isDark ? "#321417 !important" : "#FEF2F2 !important",
              color: isDark ? "#FCA5A5 !important" : "#991B1B !important",
              borderColor: isDark ? "rgba(252, 165, 165, 0.4) !important" : "#FECACA !important",
              "& .MuiAlert-icon": {
                color: isDark ? "#F87171 !important" : "#DC2626 !important",
              },
              "& .MuiAlert-message": {
                color: isDark ? "#FEE2E2 !important" : "#991B1B !important",
              },
            }),
            ...(ownerState?.severity === "warning" && {
              backgroundColor: isDark ? "#302208 !important" : "#FFFBEB !important",
              color: isDark ? "#FCD34D !important" : "#92400E !important",
              borderColor: isDark ? "rgba(252, 211, 77, 0.4) !important" : "#FDE68A !important",
              "& .MuiAlert-icon": {
                color: isDark ? "#FBBF24 !important" : "#D97706 !important",
              },
              "& .MuiAlert-message": {
                color: isDark ? "#FEF3C7 !important" : "#92400E !important",
              },
            }),
            ...(ownerState?.severity === "info" && {
              backgroundColor: isDark ? "#0C2744 !important" : "#F0F9FF !important",
              color: isDark ? "#7DD3FC !important" : "#075985 !important",
              borderColor: isDark ? "rgba(125, 211, 252, 0.4) !important" : "#BAE6FD !important",
              "& .MuiAlert-icon": {
                color: isDark ? "#38BDF8 !important" : "#0284C7 !important",
              },
              "& .MuiAlert-message": {
                color: isDark ? "#E0F2FE !important" : "#075985 !important",
              },
            }),
          }),
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            "& .MuiAlert-root": {
              boxShadow: isDark
                ? "0 12px 32px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08)"
                : "0 8px 24px rgba(0, 22, 57, 0.12)",
            },
          },
        },
      },
    },
  });
};

export const theme = getAppTheme("light");
export default theme;
