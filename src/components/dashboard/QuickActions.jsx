import React from "react";
import { Grid, Card, CardActionArea, Box, Typography } from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

export function QuickActions({ onDeposit, onTransfer, onScan, onServices }) {
  const actions = [
    {
      id: "deposit",
      title: "Depositar",
      icon: <AddCircleOutlineOutlinedIcon fontSize="medium" />,
      onClick: onDeposit,
      isPrimaryOnMobile: true,
    },
    {
      id: "transfer",
      title: "Transferir",
      icon: <SwapHorizIcon fontSize="medium" />,
      onClick: onTransfer,
      isPrimaryOnMobile: true,
    },
    {
      id: "scan",
      title: "Escanear",
      icon: <QrCodeScannerIcon fontSize="medium" />,
      onClick: onScan,
      isPrimaryOnMobile: false,
    },
    {
      id: "services",
      title: "Servicios",
      icon: <ReceiptLongIcon fontSize="medium" />,
      onClick: onServices,
      isPrimaryOnMobile: false,
    },
  ];

  return (
    <Grid container spacing={2}>
      {actions.map((act) => (
        <Grid item xs={6} sm={3} key={act.id}>
          <Card
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              transition: "all 0.2s ease-in-out",
              bgcolor: {
                xs: act.isPrimaryOnMobile ? "#0056D2" : "#FFFFFF",
                sm: "#FFFFFF",
              },
              color: {
                xs: act.isPrimaryOnMobile ? "#FFFFFF" : "#0F172A",
                sm: "#0F172A",
              },
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 8px 20px -4px rgba(15, 23, 42, 0.08)",
                borderColor: "#0066FF",
              },
            }}
          >
            <CardActionArea
              onClick={act.onClick}
              sx={{
                p: { xs: 2, sm: 2.5 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: { xs: 96, sm: 112 },
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.2,
                  bgcolor: {
                    xs: act.isPrimaryOnMobile ? "rgba(255, 255, 255, 0.18)" : "#F1F5F9",
                    sm: "#EEF4FF",
                  },
                  color: {
                    xs: act.isPrimaryOnMobile ? "#FFFFFF" : "#0056D2",
                    sm: "#0056D2",
                  },
                }}
              >
                {act.icon}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "0.85rem", sm: "0.925rem" },
                  textAlign: "center",
                }}
              >
                {act.title}
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default QuickActions;
