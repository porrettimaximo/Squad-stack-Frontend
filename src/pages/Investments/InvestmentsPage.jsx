import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  InputAdornment,
  Chip,
  Divider,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LockClockIcon from "@mui/icons-material/LockClock";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

import { useAccount } from "../../hooks/useAccount";
import AppLayout from "../../components/layout/AppLayout";
import fixedTermDepositService from "../../services/fixedTermDepositService";
import { formatCurrency, formatDate } from "../../utils/formatters";

const DURATION_OPTIONS = [
  { days: 30, label: "30 días", rate: 19.0, popular: true },
  { days: 60, label: "60 días", rate: 22.0 },
  { days: 90, label: "90 días", rate: 25.0 },
  { days: 180, label: "180 días", rate: 30.0 },
  { days: 365, label: "365 días", rate: 35.0, bestRate: true },
];

export function getTnaRate(days) {
  if (days >= 365) return 35.0;
  if (days >= 180) return 30.0;
  if (days >= 90) return 25.0;
  if (days >= 60) return 22.0;
  return 19.0;
}

const QUICK_AMOUNTS = [10000, 50000, 100000, 250000];

/**
 * HU-33: Pantalla de Inversiones / Depósitos a Plazo Fijo.
 */
export function InvestmentsPage() {
  const navigate = useNavigate();
  const { account, refreshAccount, updateBalance } = useAccount();

  // Estados del simulador
  const [amount, setAmount] = useState("10000");
  const [durationDays, setDurationDays] = useState(30);
  const [deposits, setDeposits] = useState([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Notificaciones
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const currentBalance = account?.money ?? 0;
  const numAmount = Number(amount) || 0;
  const currentTnaRate = getTnaRate(durationDays);

  // Cálculo en tiempo real de rendimiento escalonado
  const interestEarned = Math.round(numAmount * (currentTnaRate / 100 / 365) * durationDays * 100) / 100;
  const finalAmount = numAmount + interestEarned;
  const estimatedClosingDate = new Date();
  estimatedClosingDate.setDate(estimatedClosingDate.getDate() + durationDays);

  // Cargar plazos fijos existentes del usuario
  const loadDeposits = useCallback(async () => {
    setLoadingDeposits(true);
    try {
      const data = await fixedTermDepositService.getMyDeposits();
      setDeposits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("No se pudieron cargar los plazos fijos:", err.message);
    } finally {
      setLoadingDeposits(false);
    }
  }, []);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  const handleSetMaxAmount = () => {
    if (currentBalance >= 1000) {
      setAmount(Math.floor(currentBalance).toString());
    } else {
      showNotification(`Tu saldo disponible (${formatCurrency(currentBalance)}) no alcanza el mínimo de $ 1.000.`, "warning");
    }
  };

  const handleOpenConfirm = () => {
    if (!amount || numAmount <= 0) {
      showNotification("Por favor, ingresá un monto a invertir.", "warning");
      return;
    }
    if (numAmount < 1000) {
      showNotification("El monto mínimo de inversión es de $ 1.000,00 ARS.", "warning");
      return;
    }
    if (numAmount > currentBalance) {
      showNotification(`Saldo insuficiente. Tu saldo disponible es de ${formatCurrency(currentBalance)}.`, "error");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await fixedTermDepositService.create({
        amount: numAmount,
        durationDays,
      });

      showNotification(`¡Plazo Fijo constituido con éxito por ${formatCurrency(result?.amount || numAmount)}!`, "success");
      setConfirmOpen(false);

      // Descontar saldo localmente y sincronizar con backend
      if (updateBalance && currentBalance >= numAmount) {
        updateBalance(currentBalance - numAmount);
      }
      if (refreshAccount) {
        await refreshAccount();
      }
      await loadDeposits();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error al constituir el plazo fijo.";
      showNotification(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout
      activeSidebarItem="inversiones"
      currentTab={1}
      onBack={() => navigate("/dashboard")}
      backLabel="Volver al Dashboard"
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        {/* Cabecera Principal */}
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#0A192F", letterSpacing: "-0.03em" }}>
                Inversiones a Plazo Fijo
              </Typography>
              <Chip
                label={`Tasa actual: ${currentTnaRate}% TNA (hasta 35%)`}
                sx={{
                  bgcolor: "#ECFDF5",
                  color: "#059669",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  border: "1px solid #A7F3D0",
                }}
              />
            </Box>
            <Typography variant="body1" sx={{ color: "#64748B", fontWeight: 500 }}>
              Multiplica tus ahorros en pesos con rendimiento escalonado garantizado y acreditación automática.
            </Typography>
          </Box>

          {/* Saldo Disponible */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              px: 3,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "#EFF6FF", color: "#0056D2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AccountBalanceWalletIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>
                Saldo Disponible
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0A192F" }}>
                {formatCurrency(currentBalance)}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Sección de Simulación y Constitución */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
            gap: 3,
            alignItems: "stretch",
            mb: 4,
          }}
        >
          {/* Formulario de Simulación */}
          <Card
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              p: { xs: 2.5, md: 3 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0A192F", mb: 1.5, fontSize: "1.05rem" }}>
                1. ¿Cuánto querés invertir?
              </Typography>

              <TextField
                fullWidth
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                error={numAmount > currentBalance && numAmount > 0}
                helperText={
                  numAmount > currentBalance && numAmount > 0
                    ? `El monto supera tu saldo disponible (${formatCurrency(currentBalance)})`
                    : numAmount > 0 && numAmount < 1000
                    ? "El monto mínimo es de $ 1.000,00"
                    : `Tasa seleccionada: ${currentTnaRate}% TNA · Rendimiento garantizado`
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontWeight: 800, color: "#0056D2", fontSize: "1.2rem" }}>$</Typography>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={handleSetMaxAmount}
                          sx={{ textTransform: "none", fontWeight: 700, color: "#0056D2", bgcolor: "#EFF6FF", "&:hover": { bgcolor: "#DBEAFE" }, borderRadius: "8px", px: 1.5 }}
                        >
                          Máximo
                        </Button>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  mb: 1.5,
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    borderRadius: "14px",
                    bgcolor: "#F8FAFC",
                  },
                }}
              />

              {/* Montos Rápidos */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
                {QUICK_AMOUNTS.map((q) => (
                  <Chip
                    key={q}
                    label={`+ ${formatCurrency(q)}`}
                    clickable
                    size="small"
                    onClick={() => setAmount(q.toString())}
                    sx={{
                      fontWeight: 600,
                      bgcolor: numAmount === q ? "#0056D2" : "#F1F5F9",
                      color: numAmount === q ? "#FFFFFF" : "#475569",
                      "&:hover": { bgcolor: numAmount === q ? "#0047B3" : "#E2E8F0" },
                    }}
                  />
                ))}
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0A192F", mb: 1.2, fontSize: "1.05rem" }}>
                2. Seleccioná el plazo
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                {DURATION_OPTIONS.map((opt) => (
                  <Button
                    key={opt.days}
                    onClick={() => setDurationDays(opt.days)}
                    variant={durationDays === opt.days ? "contained" : "outlined"}
                    size="small"
                    sx={{
                      flex: "1 1 calc(33% - 8px)",
                      minWidth: 85,
                      py: 0.9,
                      px: 1,
                      borderRadius: "10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.2,
                      textTransform: "none",
                      borderColor: durationDays === opt.days ? "#0056D2" : "#CBD5E1",
                      bgcolor: durationDays === opt.days ? "#0056D2" : "transparent",
                      color: durationDays === opt.days ? "#FFFFFF" : "#334155",
                      "&:hover": {
                        bgcolor: durationDays === opt.days ? "#0047B3" : "#F8FAFC",
                        borderColor: "#0056D2",
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "inherit", lineHeight: 1.1 }}>
                      {opt.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        color: durationDays === opt.days ? "#A7F3D0" : "#059669",
                        lineHeight: 1,
                      }}
                    >
                      {opt.rate}% TNA
                    </Typography>
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ pt: 1.5 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleOpenConfirm}
                sx={{
                  bgcolor: "#0056D2",
                  color: "#FFFFFF",
                  py: 1.6,
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#0047B3",
                    boxShadow: "0 4px 14px rgba(0, 86, 210, 0.25)",
                  },
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Constituir Plazo Fijo
              </Button>
            </Box>
          </Card>

          {/* Tarjeta de Resumen / Rendimiento Estimado */}
          <Card
            elevation={0}
            sx={{
              borderRadius: "20px",
              bgcolor: "#0A192F",
              color: "#FFFFFF",
              p: { xs: 2.5, md: 3 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Círculo decorativo de fondo */}
            <Box
              sx={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 160,
                height: 160,
                borderRadius: "50%",
                bgcolor: "rgba(0, 86, 210, 0.2)",
                pointerEvents: "none",
              }}
            />

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <TrendingUpIcon sx={{ color: "#10B981" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#94A3B8" }}>
                  Rendimiento Estimado
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}>
                  Ganancia Estimada
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: "#10B981",
                    mt: 0.5,
                    fontSize: {
                      xs: "1.75rem",
                      sm: "2rem",
                      md: numAmount > 999999 ? "1.85rem" : "2.3rem",
                    },
                    wordBreak: "break-word",
                  }}
                >
                  + {formatCurrency(interestEarned)}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)", my: 1.8 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>Monto Invertido:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#FFFFFF" }}>{formatCurrency(numAmount)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>Tasa Nominal Anual (TNA):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#10B981" }}>{currentTnaRate.toFixed(1)}%</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>Plazo de Colocación:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#FFFFFF" }}>{durationDays} días</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>Fecha de Cobro:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#38BDF8" }}>
                    {estimatedClosingDate.toLocaleDateString("es-AR")}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2, p: 1.75, borderRadius: "12px", bgcolor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                TOTAL A COBRAR AL VENCIMIENTO
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#FFFFFF",
                  mt: 0.5,
                  fontSize: { xs: "1.2rem", md: "1.35rem" },
                  wordBreak: "break-word",
                }}
              >
                {formatCurrency(finalAmount)}
              </Typography>
            </Box>
          </Card>
        </Box>

        {/* Listado de Mis Plazos Fijos */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0A192F", mb: 2, fontSize: "1.3rem" }}>
            Mis Inversiones a Plazo Fijo
          </Typography>

          {loadingDeposits ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress size={32} />
            </Box>
          ) : deposits.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: "16px",
                border: "1px dashed #CBD5E1",
                bgcolor: "#FFFFFF",
              }}
            >
              <LockClockIcon sx={{ fontSize: 42, color: "#94A3B8", mb: 1.2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#334155", fontSize: "1.05rem" }}>
                Aún no tenés plazos fijos activos
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
                Comenzá a invertir hoy desde $ 1.000 y recibí tus ganancias de forma garantizada.
              </Typography>
            </Paper>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                maxHeight: 360,
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: "4px" },
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Monto Invertido</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Tasa / Plazo</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Ganancia</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Total a Cobrar</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Vencimiento</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }} align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deposits.map((dep) => (
                    <TableRow key={dep.id} sx={{ "&:hover": { bgcolor: "#F8FAFC" } }}>
                      <TableCell sx={{ fontWeight: 600 }}>#{dep.id}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#0A192F" }}>{formatCurrency(dep.amount)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{dep.durationDays} días</Typography>
                        <Typography variant="caption" sx={{ color: "#10B981", fontWeight: 700 }}>{dep.interestRate}% TNA</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#10B981" }}>+ {formatCurrency(dep.interestEarned)}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "#0056D2" }}>{formatCurrency(dep.finalAmount)}</TableCell>
                      <TableCell sx={{ color: "#475569" }}>
                        {new Date(dep.closingDate).toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={dep.status === 1 || dep.statusName === "Active" ? "Activo" : "Finalizado"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: dep.status === 1 || dep.statusName === "Active" ? "#ECFDF5" : "#EFF6FF",
                            color: dep.status === 1 || dep.statusName === "Active" ? "#059669" : "#0056D2",
                            border: `1px solid ${dep.status === 1 || dep.statusName === "Active" ? "#A7F3D0" : "#BFDBFE"}`,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Modal de Confirmación */}
        <Dialog
          open={confirmOpen}
          onClose={() => !submitting && setConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
          disableRestoreFocus
          slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}
        >
          <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#0A192F" }}>
            Confirmar Plazo Fijo
            <IconButton onClick={() => setConfirmOpen(false)} disabled={submitting}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ borderColor: "#E2E8F0" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                Estás por constituir un plazo fijo con los siguientes términos:
              </Typography>

              <Paper elevation={0} sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>Monto a debitar:</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#EF4444" }}>- {formatCurrency(numAmount)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>Plazo:</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{durationDays} días ({currentTnaRate}% TNA)</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>Interés ganado:</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#10B981" }}>+ {formatCurrency(interestEarned)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Monto Final a Cobrar:</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0056D2" }}>{formatCurrency(finalAmount)}</Typography>
                </Box>
              </Paper>

              <Alert severity="info" icon={<InfoOutlinedIcon fontSize="inherit" />} sx={{ borderRadius: "10px" }}>
                Los fondos no podrán ser retirados antes del vencimiento ({estimatedClosingDate.toLocaleDateString("es-AR")}).
              </Alert>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmOpen(false)} disabled={submitting} sx={{ color: "#64748B", textTransform: "none", fontWeight: 600 }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmSubmit}
              disabled={submitting}
              sx={{
                bgcolor: "#0056D2",
                "&:hover": { bgcolor: "#0047B3" },
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
              }}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : "Confirmar Inversión"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notificación Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: "12px", boxShadow: 3 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppLayout>
  );
}

export default InvestmentsPage;
