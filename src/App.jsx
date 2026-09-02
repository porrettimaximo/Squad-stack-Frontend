import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, Typography, Container, Paper } from "@mui/material";
import theme from "./theme/theme";

/**
 * Pantalla inicial base (Placeholder de inicio para construir pantallas sin plumbing).
 */
function HomePage() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
          DigitalArs — Frontend
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Proyecto inicializado con Vite, React, Material UI, Axios y React Router (HU-21).
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          Estructura y librerías listas para construir pantallas sin plumbing.
        </Typography>
      </Paper>
    </Container>
  );
}

function LoginPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
          Iniciar Sesión
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ruta base /login configurada. Pantalla lista para ser implementada.
        </Typography>
      </Paper>
    </Container>
  );
}

function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        404 - Página no encontrada
      </Typography>
    </Container>
  );
}

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Rutas base configuradas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
