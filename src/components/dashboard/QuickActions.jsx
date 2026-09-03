import React from "react";
import { Grid, Card, CardActionArea, Box, Typography } from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { motion } from "framer-motion";

/**
 * QuickActions: 4 accesos directos principales
 * Efectos integrados (motion.dev):
 * - Físicas táctiles / Haptic-like feedback: whileTap con compresión scale 0.95.
 * - Levitation al hover: whileHover con elevación sutil de -3px y scale 1.02.
 * - Transición física con spring (stiffness: 400, damping: 20).
 */
export function QuickActions({ onDeposit, onTransfer, onScan, onServices }) {
  const actions = [
    {
      id: "deposit",
      title: "Depositar",
      icon: <AddCircleOutlineOutlinedIcon fontSize="medium" />,
      onClick: onDeposit,
      isPrimaryMobile: true,
    },
    {
      id: "transfer",
      title: "Transferir",
      icon: <SwapHorizIcon fontSize="medium" />,
      onClick: onTransfer,
      isPrimaryMobile: true,
    },
    {
      id: "scan",
      title: "Escanear",
      icon: <QrCodeScannerIcon fontSize="medium" />,
      onClick: onScan,
      isPrimaryMobile: false,
    },
    {
      id: "services",
      title: "Servicios",
      icon: <ReceiptLongIcon fontSize="medium" />,
      onClick: onServices,
      isPrimaryMobile: false,
    },
  ];

  return (
    <Grid container spacing={2}>
      {actions.map((act, index) => (
        <Grid item xs={6} md={3} key={act.id}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: index * 0.06,
              ease: "easeOut",
            }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            style={{ height: "100%" }}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: "16px",
                border: {
                  xs: act.isPrimaryMobile ? "none" : "1px solid #E2E8F0",
                  md: "1px solid #E2E8F0",
                },
                bgcolor: {
                  xs: act.isPrimaryMobile ? "#0056D2" : "#FFFFFF",
                  md: "#FFFFFF",
                },
                color: {
                  xs: act.isPrimaryMobile ? "#FFFFFF" : "#0F172A",
                  md: "#0F172A",
                },
                boxShadow: "0 2px 8px -2px rgba(15, 23, 42, 0.04)",
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                  boxShadow: "0 8px 22px -4px rgba(0, 86, 210, 0.16)",
                  borderColor: "#0066FF",
                },
              }}
            >
              <CardActionArea
                onClick={act.onClick}
                sx={{
                  p: { xs: 2, sm: 2.2, md: 2.5 },
                  display: "flex",
                  flexDirection: { xs: act.isPrimaryMobile ? "column" : "row", md: "column" },
                  alignItems: "center",
                  justifyContent: "center",
                  gap: { xs: 1, md: 0 },
                  minHeight: { xs: act.isPrimaryMobile ? 84 : 58, md: 104 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: act.isPrimaryMobile ? 36 : 28, md: 44 },
                    height: { xs: act.isPrimaryMobile ? 36 : 28, md: 44 },
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: { xs: act.isPrimaryMobile ? 0.75 : 0, md: 1.2 },
                    mr: { xs: !act.isPrimaryMobile ? 1 : 0, md: 0 },
                    bgcolor: {
                      xs: act.isPrimaryMobile ? "transparent" : "transparent",
                      md: "#EEF4FF",
                    },
                    color: {
                      xs: act.isPrimaryMobile ? "#FFFFFF" : "#0F172A",
                      md: "#0056D2",
                    },
                  }}
                >
                  {act.icon}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "0.95rem", md: "0.925rem" },
                    textAlign: "center",
                  }}
                >
                  {act.title}
                </Typography>
              </CardActionArea>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
}

export default QuickActions;
