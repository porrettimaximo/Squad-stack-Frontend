import React from "react";
import { Box, Card, Typography, Skeleton } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { motion } from "framer-motion";

/**
 * BalanceCard: Tarjeta destacada de saldo (Figma 1:1)
 * Efectos integrados (motion.dev & reactbits.dev):
 * - Entrada suave con elevación: initial y animate con spring/easeOut.
 * - Levitation al hover: whileHover con desplazamiento en eje Y (-4px) y aumento sutil de sombra.
 * - Microinteracción en badge de tendencia: whileHover con escalado suave (scale 1.08).
 */
export function BalanceCard({
  balance = 45230.50,
  cardNumber = "4892",
  cvu,
  trend = 2.4,
  loading = false,
}) {
  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={220}
        sx={{ borderRadius: "20px", bgcolor: "#E2E8F0" }}
      />
    );
  }

  // Separar parte entera y decimal
  const formattedParts = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance).split(",");

  const integerPart = formattedParts[0] || "0";
  const decimalPart = formattedParts[1] || "00";

  const displayCvu = cvu || (cardNumber && cardNumber.length > 10 ? cardNumber : `000000310001000000000${cardNumber || "04"}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] }}
      whileHover={{ y: -5, transition: { duration: 0.25, ease: "easeOut" } }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: "20px",
          p: { xs: 3.5, sm: 4 },
          minHeight: { md: 220 },
          background: "#0058BC",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.18)",
          transition: "box-shadow 0.25s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
          },
        }}
      >
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

          {/* Badge de tendencia con microinteracción animada */}
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
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
                cursor: "pointer",
              }}
            >
              <TrendingUpIcon sx={{ fontSize: "1rem" }} />
              +{trend}%
            </Box>
          </motion.div>
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

        {/* Pie de Tarjeta: DigitalArs (CVU) y Círculos */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "rgba(255, 255, 255, 0.75)",
                fontSize: "0.75rem",
                fontWeight: 600,
                mb: 0.25,
              }}
            >
              DigitalArs (CVU)
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.04em",
                fontSize: { xs: "0.82rem", sm: "0.92rem" },
                fontFamily: "monospace",
              }}
            >
              {displayCvu}
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
    </motion.div>
  );
}

export default BalanceCard;
