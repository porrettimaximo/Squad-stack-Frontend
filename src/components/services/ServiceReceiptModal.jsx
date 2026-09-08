import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { downloadServicePaymentReceiptPdf } from "../../utils/pdfGenerator";
import { formatCurrency } from "../../utils/formatters";

export function ServiceReceiptModal({ open, onClose, paymentData, user }) {
  if (!paymentData) return null;

  const {
    receiptNumber,
    providerName,
    categoryName,
    referenceNumber,
    amount,
    paymentDate,
    reserveName,
  } = paymentData;

  const sourceLabel = reserveName
    ? `Reserva: ${reserveName}`
    : "Cuenta Corriente DigitalArs";

  const payerName = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || "Cliente DigitalArs");

  const formattedDate = paymentDate ? new Date(paymentDate).toLocaleString("es-AR") : new Date().toLocaleString("es-AR");

  const handleDownloadPdf = () => {
    downloadServicePaymentReceiptPdf({
      receiptNumber,
      providerName,
      categoryName,
      referenceNumber,
      amount,
      paymentDate: formattedDate,
      payerName,
      sourceLabel,
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
          p: 1,
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptLongOutlinedIcon sx={{ color: "#0056D2" }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", fontSize: "1.1rem" }}>
            Comprobante de Pago
          </Typography>
        </Box>
        <IconButton aria-label="Cerrar" onClick={onClose} sx={{ color: "#94A3B8" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>
        {/* Banner de Éxito */}
        <Box
          sx={{
            textAlign: "center",
            py: 2.5,
            px: 2,
            bgcolor: "#F0FDF4",
            borderRadius: "16px",
            border: "1px solid #DCFCE7",
            mb: 3,
          }}
        >
          <CheckCircleOutlinedIcon sx={{ fontSize: 50, color: "#16A34A", mb: 1 }} />
          <Typography sx={{ fontWeight: 800, color: "#166534", fontSize: "1.15rem" }}>
            ¡Pago realizado con éxito!
          </Typography>
          <Typography sx={{ color: "#15803D", fontSize: "0.85rem", mt: 0.3 }}>
            El servicio ha sido abonado correctamente.
          </Typography>

          <Typography sx={{ fontWeight: 900, color: "text.primary", fontSize: "1.8rem", mt: 1.5 }}>
            {formatCurrency(amount)}
          </Typography>
        </Box>

        {/* Resumen Detallado */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.6 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>Empresa / Ente</Typography>
            <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.92rem" }}>
              {providerName}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>Rubro / Categoría</Typography>
            <Typography sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.88rem" }}>
              {categoryName}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>Nº Referencia / Factura</Typography>
            <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.9rem", fontFamily: "monospace" }}>
              {referenceNumber}
            </Typography>
          </Box>

          <Divider sx={{ my: 0.5, borderStyle: "dashed" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>Origen de los Fondos</Typography>
            <Typography sx={{ fontWeight: 700, color: reserveName ? "#7C3AED" : "#0056D2", fontSize: "0.9rem" }}>
              {sourceLabel}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>Nº de Comprobante</Typography>
            <Typography sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.82rem", fontFamily: "monospace" }}>
              {receiptNumber}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>Fecha y Hora</Typography>
            <Typography sx={{ fontWeight: 500, color: "text.secondary", fontSize: "0.82rem" }}>
              {formattedDate}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<DownloadOutlinedIcon />}
          onClick={handleDownloadPdf}
          sx={{
            borderRadius: "12px",
            py: 1.1,
            fontWeight: 700,
            textTransform: "none",
            borderColor: "#0056D2",
            color: "#0056D2",
            "&:hover": { borderColor: "#00419E", bgcolor: "#EFF6FF" },
          }}
        >
          Descargar PDF
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: "12px",
            py: 1.1,
            fontWeight: 700,
            textTransform: "none",
            bgcolor: "#0056D2",
            "&:hover": { bgcolor: "#00419E" },
          }}
        >
          Finalizar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
