import React from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Divider,
  Skeleton,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SouthWestOutlinedIcon from "@mui/icons-material/SouthWestOutlined";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";

export function RecentActivity({ transactions = [], loading = false, onViewAll }) {
  const getTransactionVisuals = (tx) => {
    // Si es ingreso (Type 1: Deposit o Type 2: TransferIn)
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

  return (
    <Box>
      {/* Cabecera de Sección */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem" }}>
          Actividad Reciente
        </Typography>

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
      </Box>

      {/* Contenedor de Tarjeta */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "18px",
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ p: 2.5 }}>
            {[1, 2, 3].map((n) => (
              <Box key={n} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={18} />
                </Box>
                <Skeleton variant="text" width={80} height={24} />
              </Box>
            ))}
          </Box>
        ) : transactions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No hay movimientos registrados recientemente.
            </Typography>
          </Box>
        ) : (
          transactions.slice(0, 5).map((tx, idx) => {
            const { isIncome, icon, bgColor, iconColor } = getTransactionVisuals(tx);

            return (
              <React.Fragment key={tx.id || idx}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: { xs: 2, sm: 2.5 },
                    transition: "background-color 0.15s ease",
                    "&:hover": {
                      bgcolor: "#F8FAFC",
                    },
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
                          fontSize: "0.95rem",
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
                          mt: 0.25,
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
                      fontSize: "1rem",
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

                {idx < Math.min(transactions.length, 5) - 1 && <Divider sx={{ borderColor: "#F1F5F9" }} />}
              </React.Fragment>
            );
          })
        )}
      </Card>
    </Box>
  );
}

export default RecentActivity;
