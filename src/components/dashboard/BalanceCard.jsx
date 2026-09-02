import React from "react";
import { Box, Card, Typography, Skeleton } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export function BalanceCard({ balance = 45230.50, cardNumber = "4892", trend = 2.4, loading = false }) {
  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={220}
        sx={{ borderRadius: "20px", bgcolor: "#E2E8F0" }}
      />
    );
  }

  // Separar parte entera y parte decimal
  const formattedParts = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance).split(",");

  const integerPart = formattedParts[0] || "0";
  const decimalPart = formattedParts[1] || "00";

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "20px",
        p: { xs: 3, sm: 3.5 },
        background: "linear-gradient(135deg, #0056D2 0%, #0066FF 60%, #0077FF 100%)",
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 14px 28px -6px rgba(0, 102, 255, 0.35)",
      }}
    >
      {/* Círculo sutil de fondo decorativo */}
      <Box
        sx={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Cabecera de la Tarjeta */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: "0.75rem",
          }}
        >
          SALDO TOTAL
        </Typography>

        {/* Badge de tendencia */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.2,
            py: 0.35,
            borderRadius: "20px",
            bgcolor: "#C6F6D5",
            color: "#047857",
            fontWeight: 800,
            fontSize: "0.8rem",
          }}
        >
          <TrendingUpIcon sx={{ fontSize: "1rem" }} />
          +{trend}%
        </Box>
      </Box>

      {/* Saldo Principal Grande */}
      <Box sx={{ display: "flex", alignItems: "baseline", my: 1.5 }}>
        <Typography
          component="span"
          sx={{
            fontSize: { xs: "2.3rem", sm: "2.9rem" },
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          ${integerPart}
        </Typography>
        <Typography
          component="span"
          sx={{
            fontSize: { xs: "1.3rem", sm: "1.6rem" },
            fontWeight: 700,
            opacity: 0.9,
            ml: 0.3,
          }}
        >
          .{decimalPart}
        </Typography>
      </Box>

      {/* Línea divisoria translúcida */}
      <Box
        sx={{
          height: "1px",
          bgcolor: "rgba(255, 255, 255, 0.2)",
          my: 2.5,
        }}
      />

      {/* Pie de Tarjeta: DigitalArs Card y Círculos */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "rgba(255, 255, 255, 0.75)",
              fontSize: "0.75rem",
              fontWeight: 500,
              mb: 0.25,
            }}
          >
            DigitalArs Card
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.15em",
              fontSize: "1rem",
            }}
          >
            •••• {cardNumber}
          </Typography>
        </Box>

        {/* Emblema con dos círculos solapados translúcidos */}
        <Box sx={{ display: "flex", alignItems: "center", position: "relative", width: 44, height: 28 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.35)",
              position: "absolute",
              left: 0,
            }}
          />
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.25)",
              position: "absolute",
              right: 0,
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}

export default BalanceCard;
