import React from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Divider,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SouthWestOutlinedIcon from "@mui/icons-material/SouthWestOutlined";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import { motion } from "framer-motion";

/**
 * RecentActivity: Lista de los últimos movimientos
 * Efectos integrados (motion.dev & reactbits.dev):
 * - Entrada escalonada (Staggered entrance): cada fila entra con un delay proporcional a su índice.
 * - Desplazamiento reactivo al hover: whileHover con desplazamiento sutil en X (+4px) que da sensación de selección activa.
 */
export function RecentActivity({ transactions = [], loading = false, onViewAll }) {
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  const getTransactionVisuals = (tx) => {
    const isIncome = tx.type === 1 || tx.type === 2 || (tx.category && tx.category === "INGRESO");

    let icon = <ShoppingCartOutlinedIcon fontSize="small" />;
    let bgColor = "#F1F5F9";
    let iconColor = "#475569";

    if (isIncome) {
      icon = <SouthWestOutlinedIcon fontSize="small" />;
      bgColor = "#E6F9F0";
      iconColor = "#10B981";
    } else if (tx.category === "COMIDA" || tx.title?.toLowerCase().includes("starbucks")) {
      icon = <LocalCafeOutlinedIcon fontSize="small" />;
      bgColor = "#F1F5F9";
      iconColor = "#475569";
    } else if (tx.category === "SERVICIOS" || tx.title?.toLowerCase().includes("netflix")) {
      icon = <ReceiptOutlinedIcon fontSize="small" />;
      bgColor = "#F1F5F9";
      iconColor = "#475569";
    }

    return { isIncome, icon, bgColor, iconColor };
  };

  const formatAmount = (amount, isIncome) => {
    const formatted = new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    return `${isIncome ? "+" : "-"}$${formatted}`;
  };

  const renderItemContent = (tx) => {
    const { isIncome, icon, bgColor, iconColor } = getTransactionVisuals(tx);

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: { xs: 2, sm: 2.2, md: 2.5 },
          width: "100%",
        }}
      >
        {/* Lado Izquierdo: Ícono + Textos */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: bgColor,
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: "#0F172A",
                fontSize: { xs: "0.95rem", md: "1rem" },
                lineHeight: 1.25,
              }}
            >
              {tx.title || tx.concept || `Movimiento #${tx.id}`}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#64748B",
                fontWeight: 500,
                fontSize: "0.78rem",
                display: "block",
                mt: 0.35,
              }}
            >
              {tx.subtitle || (tx.date ? new Date(tx.date).toLocaleDateString("es-AR") : "Operación")}
            </Typography>
          </Box>
        </Box>

        {/* Lado Derecho: Monto */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            color: isIncome ? "#10B981" : "#0F172A",
            letterSpacing: "-0.01em",
            textAlign: "right",
            whiteSpace: "nowrap",
            ml: 1.5,
          }}
        >
          {formatAmount(tx.amount, isIncome)}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      {/* Cabecera de Sección con botón animado */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem" }}>
          Actividad Reciente
        </Typography>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="text"
            onClick={onViewAll}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#0066FF",
              p: 0,
              minWidth: "auto",
              "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
            }}
          >
            Ver todo
          </Button>
        </motion.div>
      </Box>

      {/* Estados de Carga / Vacío / Lista */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {[1, 2, 3].map((n) => (
            <Card key={n} elevation={0} sx={{ p: 2, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={22} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
                <Skeleton variant="text" width={75} height={22} />
              </Box>
            </Card>
          ))}
        </Box>
      ) : transactions.length === 0 ? (
        <Card elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
          <Typography variant="body2" color="text.secondary">
            No hay movimientos registrados recientemente.
          </Typography>
        </Card>
      ) : isDesktop ? (
        /* Formato Desktop: Contenedor único con divisores y animación escalonada */
        <Card
          elevation={0}
          sx={{
            borderRadius: "18px",
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
            overflow: "hidden",
            boxShadow: "0 2px 10px -2px rgba(15, 23, 42, 0.04)",
          }}
        >
          {transactions.slice(0, 5).map((tx, idx) => (
            <React.Fragment key={tx.id || idx}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                whileHover={{ x: 4, backgroundColor: "rgba(248, 250, 252, 0.9)" }}
                style={{ cursor: "pointer", transition: "background-color 0.15s ease" }}
              >
                {renderItemContent(tx)}
              </motion.div>
              {idx < Math.min(transactions.length, 5) - 1 && <Divider sx={{ borderColor: "#F1F5F9" }} />}
            </React.Fragment>
          ))}
        </Card>
      ) : (
        /* Formato Mobile: Tarjetas individuales separadas con efecto hover/tap */
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {transactions.slice(0, 5).map((tx, idx) => (
            <motion.div
              key={tx.id || idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  overflow: "hidden",
                  boxShadow: "0 2px 6px -2px rgba(15, 23, 42, 0.04)",
                }}
              >
                {renderItemContent(tx)}
              </Card>
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default RecentActivity;
