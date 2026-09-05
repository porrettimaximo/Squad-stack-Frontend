import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import { AccountProvider } from "./context/AccountContext";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DepositPage from "./pages/Deposit/DepositPage";
import TransferPage from "./pages/Transfer/TransferPage";
import HistoryPage from "./pages/History/HistoryPage";

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AccountProvider>
        <BrowserRouter>
          <Routes>
            {/* HU-24: Dashboard principal de la billetera */}
            <Route path="/" element={<DashboardPage />} />
            {/* HU-25: Pantalla de depósito de fondos */}
            <Route path="/deposit" element={<DepositPage />} />
            {/* HU-26: Pantalla de transferencia de fondos */}
            <Route path="/transfer" element={<TransferPage />} />
            {/* HU-27: Historial con filtros y paginación */}
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/historial" element={<HistoryPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </BrowserRouter>
      </AccountProvider>
    </ThemeProvider>
  );
}

export default App;
