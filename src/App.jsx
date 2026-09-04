import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import { AccountProvider } from "./context/AccountContext";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DepositPage from "./pages/Deposit/DepositPage";

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
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </BrowserRouter>
      </AccountProvider>
    </ThemeProvider>
  );
}

export default App;
