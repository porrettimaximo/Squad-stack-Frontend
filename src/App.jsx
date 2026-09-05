import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import { AuthProvider } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import { Login } from "./pages/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import ForbiddenPage from "./pages/Forbidden/ForbiddenPage";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import DepositPage from "./pages/Deposit/DepositPage";
import TransferPage from "./pages/Transfer/TransferPage";
import HistoryPage from "./pages/History/HistoryPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AccountProvider>
          <BrowserRouter>
            <Routes>
              {/* HU-22: Pantalla de Login */}
              <Route path="/login" element={<Login />} />

              {/* HU-23: Error 403 - Acceso Denegado */}
              <Route path="/403" element={<ForbiddenPage />} />

              {/* HU-23: Rutas Protegidas (Requieren Login) */}
              <Route element={<ProtectedRoute />}>
                {/* HU-24: Dashboard principal */}
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* HU-25: Depósito de fondos */}
                <Route path="/deposit" element={<DepositPage />} />

                {/* HU-26: Transferencia de fondos */}
                <Route path="/transfer" element={<TransferPage />} />

                {/* HU-27: Historial de movimientos con filtros y gráficos */}
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/historial" element={<HistoryPage />} />

                {/* HU-29: Panel de Administración (Solo accesible con Rol Admin) */}
                <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
                  <Route path="/admin" element={<AdminUsersPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>
              </Route>

              {/* Fallback 404 - Página no encontrada */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AccountProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
