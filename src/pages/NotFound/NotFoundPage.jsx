import { Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box 
    sx={{ 
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
     }}>
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, md: 6 },
        textAlign: "center",
        maxWidth: 480,
        borderRadius: "20px",
        border: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 10px 30px rgba(0, 22, 57, 0.05)",
        }}
    >
      <Typography variant="h1" 
      sx={{
        fontSize: "5rem",
        fontWeight: 800, 
        letterSpacing: "-0.03em",
        color: "#0056D2",
        mb: 1,
      }}>
       ERROR 404
      </Typography>
      <Typography 
      variant="h5" 
      sx={{ 
        fontWeight: 800,
        color: "#001639",
        mb: 1.5 }}>
        Página no encontrada
      </Typography>
      <Typography
          variant="body2"
          sx={{
            color: "#64748B",
            mb: 4,
            fontWeight: 500,
          }}
        >
          La ruta que intenta consultar no existe.
        </Typography>
      <Button 
        variant="contained"
        onClick={() => navigate("/dashboard")}
        sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "1rem",
            py: 1.5,
            px: 4,
            borderRadius: "12px",
            background: "linear-gradient(135deg, #0056D2 0%, #0066FF 60%, #0077FF 100%)", // Gradient institucional
            boxShadow: "0px 4px 12px rgba(0, 86, 210, 0.25)",
            "&:hover": {
              backgroundColor: "#0047B3",
            },
          }}
        > Volver al Inicio
      </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;