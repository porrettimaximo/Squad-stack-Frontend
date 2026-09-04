import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Divider, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatters";

/**
 * Componente reutilizable para la pantalla de éxito (Paso 4) de operaciones financieras (Depósito, Transferencia).
 * Reemplaza más de 80 líneas duplicadas entre DepositPage y TransferPage.
 */
export function SuccessStep({
  title = "¡Operación exitosa!",
  subtitle = "La operación fue procesada correctamente.",
  amount = 0,
  details = [],
  onFinish,
  autoRedirectSeconds = 3,
}) {
  const [secondsLeft, setSecondsLeft] = useState(autoRedirectSeconds);

  useEffect(() => {
    if (!autoRedirectSeconds || !onFinish) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirectSeconds, onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        width: "100%",
        paddingTop: 16,
        paddingBottom: 16,
      }}
    >
      {/* Icono animado de éxito */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "#DCFCE7",
            color: "#16A34A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.2)",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 50 }} />
        </Box>
      </motion.div>

      <Typography
        variant="h5"
        sx={{ fontWeight: 800, color: "#0F172A", mb: 1, fontSize: { xs: "1.4rem", md: "1.6rem" } }}
      >
        {title}
      </Typography>

      <Typography sx={{ color: "#64748B", fontSize: "0.95rem", mb: 3, maxWidth: 380 }}>
        {subtitle}
      </Typography>

      {/* Monto destacado */}
      {amount > 0 && (
        <Paper
          elevation={0}
          sx={{
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            p: 2.5,
            width: "100%",
            maxWidth: 400,
            mb: 3,
          }}
        >
          <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600, mb: 0.5 }}>
            Monto operado
          </Typography>
          <Typography sx={{ fontSize: "1.85rem", fontWeight: 800, color: "#0F172A" }}>
            {formatCurrency(amount)}
          </Typography>

          {details.length > 0 && (
            <>
              <Divider sx={{ my: 2, borderColor: "#E2E8F0" }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {details.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#0F172A" }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Botón de acción */}
      <Button
        variant="contained"
        fullWidth
        endIcon={<ArrowForwardIcon />}
        onClick={onFinish}
        sx={{
          maxWidth: 400,
          bgcolor: "#0056D2",
          color: "#FFFFFF",
          borderRadius: "14px",
          py: 1.6,
          fontSize: "1rem",
          fontWeight: 700,
          textTransform: "none",
          boxShadow: "0 4px 14px rgba(0, 86, 210, 0.25)",
          "&:hover": { bgcolor: "#0047b3" },
        }}
      >
        Volver al inicio {secondsLeft > 0 && `(${secondsLeft}s)`}
      </Button>
    </motion.div>
  );
}

export default SuccessStep;
