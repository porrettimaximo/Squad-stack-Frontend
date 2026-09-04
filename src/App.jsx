import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* HU-24: Dashboard principal de la billetera */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* HU-29: Panel de Administración (Gestión de Usuarios) */}
          <Route path="/admin" element={<AdminUsersPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />

          {/* Fallback */}
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
