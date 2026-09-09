import React from "react";
import { Box, Typography } from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { motion } from "framer-motion";

/**
 * QuickActions: 4 botones de acceso rápido que ocupan todo el ancho de la BalanceCard.
 * Desktop: fila de 4 botones grandes con icono + label.
 * Mobile: 2x2 grid.
 */
export function QuickActions({ onDeposit, onTransfer, onReserves, onServices, onScan }) {
  const actions = [
    {
      id: "deposit",
      title: "Depositar",
      icon: <AddCircleOutlineOutlinedIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }} />,
      onClick: onDeposit,
      isPrimaryMobile: true,
    },
    {
      id: "transfer",
      title: "Transferir",
      icon: <SwapHorizIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }} />,
      onClick: onTransfer,
      isPrimaryMobile: true,
    },
    {
      id: "reserves",
      title: "Reservas",
      icon: <SavingsOutlinedIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }} />,
      onClick: onReserves || onScan,
      isPrimaryMobile: false,
    },
    {
      id: "services",
      title: "Servicios",
      icon: <ReceiptLongIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }} />,
      onClick: onServices,
      isPrimaryMobile: false,
    },
  ];

  return (
    /* Fila de 4 botones en desktop — ocupa exactamente el mismo ancho que la BalanceCard */
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 1.5,
      }}
    >
      {actions.map((act, index) => (
        <Box
          key={act.id}
          component={motion.button}
          type="button"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          aria-label={`Acción rápida: ${act.title}`}
          onClick={act.onClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              act.onClick && act.onClick();
            }
          }}
          sx={{
            width: "100%",
            height: "100%",
            minHeight: { xs: 84, md: 110 },
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: "0 2px 8px -2px rgba(15, 23, 42, 0.04)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 0.75, md: 1 },
            cursor: "pointer",
            fontFamily: "inherit",
            p: { xs: 1.5, md: 2 },
            outline: "none",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
            "&:hover": {
              boxShadow: "0 8px 22px -4px rgba(0, 86, 210, 0.16)",
              borderColor: "#0058BC",
              bgcolor: "action.hover",
            },
            "&:focus-visible": {
              outline: "2px solid #38BDF8 !important",
              outlineOffset: "2px",
              borderRadius: "16px",
            },
            /* Mobile: colores destacados para las primeras 2 acciones */
            ...(act.isPrimaryMobile && {
              bgcolor: { xs: "#0058BC", md: "background.paper" },
              color: { xs: "#FFFFFF", md: "text.primary" },
              border: { xs: "none", md: "1px solid" },
              borderColor: { md: "divider" },
              "&:hover": {
                boxShadow: "0 8px 22px -4px rgba(0, 86, 210, 0.16)",
                borderColor: "#0058BC",
                bgcolor: { xs: "#004FA8", md: "action.hover" },
              },
            }),
          }}
        >
          {/* Icono con fondo circular solo en desktop */}
          <Box
            sx={{
              width: { xs: 38, md: 50 },
              height: { xs: 38, md: 50 },
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: {
                xs: act.isPrimaryMobile ? "rgba(255,255,255,0.18)" : "transparent",
                md: "rgba(0, 86, 210, 0.12)",
              },
              color: {
                xs: act.isPrimaryMobile ? "#FFFFFF" : "text.primary",
                md: "#0058BC",
              },
            }}
          >
            {act.icon}
          </Box>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: "0.92rem", md: "0.95rem" },
              textAlign: "center",
              color: "inherit",
            }}
          >
            {act.title}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default QuickActions;
