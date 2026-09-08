import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { getAppTheme } from "../theme/theme";

const ThemeContext = createContext({
  darkMode: false,
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export function AppThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("digitalars_theme_mode");
      return saved === "dark";
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("digitalars_theme_mode", next ? "dark" : "light");
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    try {
      const mode = darkMode ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", mode);
      if (darkMode) {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    } catch {}
  }, [darkMode]);

  const theme = useMemo(() => getAppTheme(darkMode ? "dark" : "light"), [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default AppThemeProvider;
