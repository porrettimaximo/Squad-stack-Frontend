import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

import iconoPrincipal from "../assets/iconoPrincipal.png";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    // Formulario con validaciones
    if (!email || !password) {
      setError("Por favor, ingrese su email y contraseña.");
      return;
    }

    try {
      setLoading(true);
      // Persiste sesión en AuthContext
      await login({ email, password });

      // Redirección al Dashboard principal para todos los roles (HU-22 / HU-23)
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Credenciales inválidas. Por favor, verifique su email y contraseña.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#001639",
        p: 2,
      }}>
      <Card
        elevation={0}
        sx={{
          maxWidth: 420,
          width: "100%",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "#02122c",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
        }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Box
              component="img"
              src={iconoPrincipal}
              alt="DigitalArs"
              sx={{
                width: "100%",
                maxWidth: 240,
                height: "auto",
                maxHeight: 110,
                objectFit: "contain",
                mx: "auto",
                display: "block",
                mb: 1.5,
              }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#FFFFFF", mb: 0.5, display: "block" }}
            >
              Correo Electrónico
            </Typography>
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              name="email"
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#F8FAFC",
                  "& fieldset": { borderColor: "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#0056D2" },
                },
              }}
            />

            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#FFFFFF", mb: 0.5, display: "block" }}
            >
              Contraseña
            </Typography>
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              type="password"
              id="password"
              placeholder="********"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#F8FAFC",
                  "& fieldset": { borderColor: "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#0056D2" },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                bgcolor: "#0056D2",
                boxShadow: "0px 4px 12px rgba(0, 86, 210, 0.25)",
                "&:hover": {
                  bgcolor: "#0047B3",
                },
                "&.Mui-disabled": {
                  bgcolor: "#CBD5E1",
                },
              }}>
              {loading ? (
                <CircularProgress size={24} sx={{ color: "#FFFFFF" }} />
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;