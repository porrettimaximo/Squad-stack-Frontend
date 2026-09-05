import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import { AuthProvider } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Páginas
import Login from "./pages/Login";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DepositPage from "./pages/Deposit/DepositPage";
import TransferPage from "./pages/Transfer/TransferPage";
import HistoryPage from "./pages/History/HistoryPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import ForbiddenPage from "./pages/Forbidden/ForbiddenPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AccountProvider>
          <BrowserRouter>
            <Routes>
              {/* Ruta pública de autenticación */}
              <Route path="/login" element={<Login />} />

              {/* Páginas de error / autorización */}
              <Route path="/403" element={<ForbiddenPage />} />

              {/* Rutas protegidas para cualquier usuario autenticado */}
              <Route element={<ProtectedRoute />}>
                {/* HU-24: Dashboard principal de la billetera */}
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* HU-25: Pantalla de depósito de fondos */}
                <Route path="/deposit" element={<DepositPage />} />

                {/* HU-26: Pantalla de transferencia de fondos */}
                <Route path="/transfer" element={<TransferPage />} />

                {/* HU-27: Historial con filtros y paginación */}
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/historial" element={<HistoryPage />} />

                {/* HU-28: Pantalla de perfil de usuario */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/perfil" element={<ProfilePage />} />
              </Route>

              {/* Rutas exclusivas para Administradores */}
              <Route element={<ProtectedRoute allowedRoles={["Admin", "admin"]} />}>
                <Route path="/admin" element={<AdminUsersPage />} />
              </Route>

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AccountProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

