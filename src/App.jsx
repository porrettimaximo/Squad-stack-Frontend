import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import { AuthProvider } from "./context/AuthContext";
import HistoryPage from "./pages/History/HistoryPage";
import LoginPage from "./pages/Login/LoginPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/historial" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/historial" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/historial" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
