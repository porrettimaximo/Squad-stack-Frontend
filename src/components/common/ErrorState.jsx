import React from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { motion } from "framer-motion";

/**
 * ErrorState: Componente para manejo de errores con opción de reintento (HU-30).
 */
export function ErrorState({
  title = "Ocurrió un error al cargar la información",
  message = "No se pudieron obtener los datos. Por favor, verifica tu conexión e intenta nuevamente.",
  onRetry,
  retryLabel = "Reintentar",
  sx = {},
}) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      sx={{
        py: { xs: 4, md: 6 },
        px: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        bgcolor: "#FEF2F2",
        borderRadius: "16px",
        border: "1px solid #FECACA",
        width: "100%",
        mx: "auto",
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: "#FEE2E2",
          color: "#DC2626",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <ErrorOutlineOutlinedIcon sx={{ fontSize: 32 }} />
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: "#991B1B",
          fontWeight: 700,
          fontSize: "1.05rem",
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "#B91C1C",
          maxWidth: 420,
          mb: onRetry ? 2.5 : 0,
        }}
      >
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{
            bgcolor: "#DC2626",
            borderRadius: "10px",
            px: 3,
            py: 0.9,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#B91C1C",
            },
          }}
        >
          {retryLabel}
        </Button>
      )}
    </Box>
  );
}

export default ErrorState;
