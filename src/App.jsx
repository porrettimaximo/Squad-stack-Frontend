import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import { Login } from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* HU-22: Pantalla de login */}
            <Route path="/login" element={<Login />} />

            {/* HU-24: Dashboard principal de la billetera */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Ruta por defecto al login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
