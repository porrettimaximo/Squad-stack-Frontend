import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Divider,
  Paper,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import { formatCurrency } from "../../utils/formatters";
import { downloadTransferReceiptPdf } from "../../utils/pdfGenerator";

/**
 * Modal reutilizable de Comprobante / Información Completa de Transferencia.
 * Se utiliza tanto al finalizar una transferencia como al hacer clic en una transferencia desde el Historial.
 * Permite ver todos los datos de origen, destino y descargar el comprobante en PDF oficial.
 */
export function TransferReceiptModal({ open, onClose, transferData }) {
  const [copied, setCopied] = useState(false);

  if (!transferData) return null;

  const {
    operationId = "TX-0001",
    date = new Date().toLocaleString("es-AR"),
    amount = 0,
    motive = "Varios",
    origin = {},
    destination = {},
    status = "Completada / Exitosa",
  } = transferData;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(String(operationId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    downloadTransferReceiptPdf({
      operationId,
      date,
      amount,
      motive,
      origin,
      destination,
      status,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: { xs: 0.5, sm: 1 },
          bgcolor: "#FFFFFF",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              bgcolor: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0056D2",
            }}
          >
            <ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.05rem" }}>
              Información de la transferencia
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B" }}>
              Comprobante digital oficial DigitalArs
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#94A3B8" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#FAFAFA" }}>
        {/* Banner de Estado y Monto */}
        <Box sx={{ textAlign: "center", my: 1 }}>
          <Chip
            icon={<CheckCircleOutlinedIcon sx={{ fontSize: "16px !important", color: "#16A34A !important" }} />}
            label={status}
            size="small"
            sx={{ bgcolor: "#DCFCE7", color: "#15803D", fontWeight: 700, mb: 1 }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#0F172A",
              fontSize: { xs: "1.75rem", sm: "2.1rem" },
              letterSpacing: "-0.02em",
            }}
          >
            {formatCurrency(amount)}
          </Typography>

          {/* Número de Operación y Fecha */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1.5, mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                Operación:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: "monospace", color: "#0F172A" }}>
                {operationId}
              </Typography>
              <Tooltip title={copied ? "¡Copiado!" : "Copiar ID"}>
                <IconButton size="small" onClick={handleCopyId} sx={{ p: 0.2 }}>
                  <ContentCopyIcon sx={{ fontSize: 13, color: copied ? "#16A34A" : "#64748B" }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
              •
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B" }}>
              {date}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 1. Datos de la Cuenta de Origen (Mi cuenta) */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "14px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Chip
              label="Cuenta de Origen (Emisor)"
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: "0.72rem",
                bgcolor: "#EFF6FF",
                color: "#1D4ED8",
                borderRadius: "8px",
              }}
            />
            <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>
              {origin.bank || "DigitalArs Billetera Virtual"}
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
            <Box>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>TITULAR</Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>
                {origin.name || "---"}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>Nº DE CUENTA</Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>
                Cuenta #{origin.accountId} {origin.accountNumber ? `(${origin.accountNumber})` : ""}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>EMAIL</Typography>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", wordBreak: "break-all" }}>
                {origin.email || "---"}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>ALIAS</Typography>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0056D2" }}>
                {origin.alias || "---"}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>CVU</Typography>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", letterSpacing: "0.02em" }}>
                {origin.cvu || "---"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Indicador de Flujo */}
        <Box sx={{ display: "flex", justifyContent: "center", my: -0.5 }}>
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              bgcolor: "#0056D2",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0, 86, 210, 0.3)",
            }}
          >
            <ArrowDownwardIcon sx={{ fontSize: 15 }} />
          </Box>
        </Box>

        {/* 2. Datos de la Cuenta de Destino (La otra cuenta / A quién) */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "14px",
            bgcolor: "#FFFFFF",
            border: "1.5px solid #BBF7D0",
            mb: 1.5,
            mt: 0.8,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Chip
              label="Cuenta de Destino (Receptor / A quién)"
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: "0.72rem",
                bgcolor: "#DCFCE7",
                color: "#166534",
                borderRadius: "8px",
              }}
            />
            <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>
              {destination.bank || "DigitalArs Billetera Virtual"}
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
            <Box>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>A QUIÉN (TITULAR)</Typography>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: "#0F172A" }}>
                {destination.name || "---"}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>Nº DE CUENTA</Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>
                Cuenta #{destination.accountId} {destination.accountNumber ? `(${destination.accountNumber})` : ""}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>EMAIL</Typography>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", wordBreak: "break-all" }}>
                {destination.email || "---"}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>ALIAS</Typography>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0056D2" }}>
                {destination.alias || "---"}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>CVU</Typography>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", letterSpacing: "0.02em" }}>
                {destination.cvu || "---"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 3. Detalle de la Operación */}
        <Paper
          elevation={0}
          sx={{
            p: 1.8,
            borderRadius: "14px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            gap: 0.8,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>Motivo / Concepto</Typography>
            <Chip label={motive} size="small" sx={{ fontWeight: 700, bgcolor: "#EFF6FF", color: "#0056D2" }} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>Comisión de transferencia</Typography>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#10B981" }}>
              Gratis ($ 0,00)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>Canal</Typography>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0F172A" }}>
              DigitalArs Web Banking
            </Typography>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.2,
          justifyContent: "space-between",
        }}
      >
        {/* Botón Descargar en PDF */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<PictureAsPdfIcon />}
          onClick={handleDownloadPdf}
          sx={{
            bgcolor: "#0056D2",
            color: "#FFFFFF",
            borderRadius: "12px",
            py: 1.3,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(0, 86, 210, 0.25)",
            "&:hover": { bgcolor: "#0047B3" },
          }}
        >
          Descargar en PDF
        </Button>

        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
          sx={{
            borderRadius: "12px",
            py: 1.3,
            fontWeight: 700,
            color: "#475569",
            borderColor: "#CBD5E1",
            textTransform: "none",
            "&:hover": { bgcolor: "#F8FAFC", borderColor: "#94A3B8" },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TransferReceiptModal;
