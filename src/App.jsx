import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import { AccountProvider } from "./context/AccountContext";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DepositPage from "./pages/Deposit/DepositPage";
import TransferPage from "./pages/Transfer/TransferPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AccountProvider>
        <BrowserRouter>
          <Routes>
            {/* HU-24: Dashboard principal de la billetera */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* HU-25: Pantalla de depósito de fondos */}
            <Route path="/deposit" element={<DepositPage />} />

            {/* HU-26: Pantalla de transferencia de fondos */}
            <Route path="/transfer" element={<TransferPage />} />

            {/* HU-29: Panel de Administración (Gestión de Usuarios) */}
            <Route path="/admin" element={<AdminUsersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />

            {/* Fallback */}
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </BrowserRouter>
      </AccountProvider>
    </ThemeProvider>
  );
}

export default App;
