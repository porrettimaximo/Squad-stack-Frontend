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
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import DotGrid from "../components/common/DotGrid";
import iconoPrincipal from "../assets/iconoPrincipal.png";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const authData = await login({ email, password });

      // Redirección según el rol del usuario (Admin a su panel, User a la billetera)
      const role = authData?.role?.toLowerCase();
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Credenciales inválidas. Por favor, verifique su email y contraseña.";
      setError(message);
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#001639",
      }}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}>
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#0f182c"
          activeColor="#60A5FA"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </Box>
      <Card
        elevation={0}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 420,
          width: "100%",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "rgba(2, 18, 44, 0.85)",
          backdropFilter: "blur(8px)",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
          m: 2,
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
              sx={{
                fontWeight: 600,
                color: "#FFFFFF",
                mb: 0.5,
                display: "block",
              }}>
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
                  backgroundColor: "action.hover",
                  "& fieldset": { borderColor: "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#0056D2" },
                },
              }}
            />

            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#FFFFFF",
                mb: 0.5,
                display: "block",
              }}>
              Contraseña
            </Typography>
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="********"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        disabled={loading}
                        size="small"
                        sx={{ color: "text.secondary", mr: 0.5 }}>
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "action.hover",
                  pr: 1,
                  "& fieldset": { borderColor: "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#0056D2" },
                  "& input": { color: "text.primary" },
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
