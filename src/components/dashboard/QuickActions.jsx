import React from "react";
import { Box, Typography } from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { motion } from "framer-motion";

/**
 * QuickActions: 4 botones de acceso rápido que ocupan todo el ancho de la BalanceCard.
 * Desktop: fila de 4 botones grandes con icono + label.
 * Mobile: 2x2 grid.
 */
export function QuickActions({ onDeposit, onTransfer, onScan, onServices }) {
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
      id: "scan",
      title: "Escanear",
      icon: <QrCodeScannerIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }} />,
      onClick: onScan,
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
        <motion.div
          key={act.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          style={{ height: "100%" }}
        >
          <Box
            onClick={act.onClick}
            sx={{
              height: "100%",
              minHeight: { xs: 84, md: 110 },
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              color: "#0F172A",
              boxShadow: "0 2px 8px -2px rgba(15, 23, 42, 0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 0.75, md: 1 },
              cursor: "pointer",
              transition: "box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
              "&:hover": {
                boxShadow: "0 8px 22px -4px rgba(0, 86, 210, 0.16)",
                borderColor: "#0058BC",
                bgcolor: "#F0F6FF",
              },
              "&:active": {
                transform: "scale(0.97)",
              },
              /* Mobile: colores distintos para las primeras 2 acciones */
              ...(act.isPrimaryMobile && {
                bgcolor: { xs: "#0058BC", md: "#FFFFFF" },
                color: { xs: "#FFFFFF", md: "#0F172A" },
                border: { xs: "none", md: "1px solid #E2E8F0" },
                "&:hover": {
                  boxShadow: "0 8px 22px -4px rgba(0, 86, 210, 0.16)",
                  borderColor: "#0058BC",
                  bgcolor: { xs: "#004FA8", md: "#F0F6FF" },
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
                  md: "#EEF4FF",
                },
                color: {
                  xs: act.isPrimaryMobile ? "#FFFFFF" : "#0F172A",
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
        </motion.div>
      ))}
    </Box>
  );
}

export default QuickActions;
