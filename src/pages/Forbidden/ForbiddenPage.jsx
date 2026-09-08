import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

export const ForbiddenPage = () => {
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
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          textAlign: "center",
          maxWidth: 520,
          borderRadius: "20px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 10px 30px rgba(0, 22, 57, 0.05)",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "#FEE2E2",
            color: "#EF4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontSize: "4rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#EF4444",
            lineHeight: 1,
            mb: 1.5,
          }}
        >
          403
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "#001639",
            mb: 1.5,
          }}
        >
          Acceso Denegado
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#64748B",
            mb: 4,
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          No dispones de los permisos de <strong>Administrador</strong> necesarios para acceder a este panel de gestión.
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
            background: "linear-gradient(135deg, #0056D2 0%, #0066FF 60%, #0077FF 100%)",
            boxShadow: "0px 4px 12px rgba(0, 86, 210, 0.25)",
            "&:hover": {
              backgroundColor: "#0047B3",
            },
          }}
        >
          Volver al Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default ForbiddenPage;
