import { useState, } from "react";
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

    //Formulario con validaciones
    if (!email || !password) {
      setError("Por favor, ingrese su email y contraseña.");
      return;
    }

    try {
      setLoading(true);
      //Persiste sesion en AuthContext
      const responseData = await login({ email, password });

      const userRole = responseData?.role || responseData?.user?.role;
      //Redireccion segun rol
      if (userRole === "Admin" || userRole === "admin") {
        navigate("/admin"), { replace: true };
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Credenciales invalidas. Por favor, verifique su email y contraseña.";
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
        backgroundColor: "#F8FAFC",
        p: 2,
      }}>
      <Card
        elevation={0}
        sx={{ 
          maxWidth: 420, 
          width: "100%",
          borderRadius: "20px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 10px 30px rgba(0, 22, 57, 0.05)",
        }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ mb:3, textAlign: "center"}}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#001639",
                mb: 1,
              }}>
              DigitalArs
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
              Debe iniciar sesion para continuar
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "10px" }}>
              {error}{" "}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#0F172A", mb: 0.5, display: "block"}}
              >Correo Electronico
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
                "& .MuiOutlinedInput-root":{
                  borderRadius: "12px",
                  backgroundColor: "#F8FAFC",
                  "& fieldset": { borderColor: "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#0056D2"},
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#0F172A", mb: 0.5, display: "block" }}>
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
                  "& fieldset": { borderColor: "#CBD5E1"},
                  "&:hover fieldset": { borderColor: "#0056D2"},
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
                background:
                "linear-gradient(135deg, #0056D2 0%, #0066FF 60%, #0077FF 100%)",
                boxShadow: "0px 4px 12px rgba(0, 86, 210, 0.25)",
                "&:hover": {
                  backgroundColor: "#0047B3"
                },
                "&.Mui-disabled": {
                  background: "#CBD5E1",
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