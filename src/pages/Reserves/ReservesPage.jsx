import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  CircularProgress,
  Grid,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BeachAccessOutlinedIcon from "@mui/icons-material/BeachAccessOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { motion } from "framer-motion";

import AppLayout from "../../components/layout/AppLayout";
import { useAccount } from "../../hooks/useAccount";
import {
  getReserves,
  createReserve,
  depositIntoReserve,
  withdrawFromReserve,
  deleteReserve,
} from "../../services/reservesService";
import { formatCurrency } from "../../utils/formatters";

const ICON_OPTIONS = [
  { id: "savings", label: "Ahorro", icon: <SavingsOutlinedIcon /> },
  { id: "travel", label: "Vacaciones", icon: <BeachAccessOutlinedIcon /> },
  { id: "car", label: "Vehículo", icon: <DirectionsCarOutlinedIcon /> },
  { id: "home", label: "Hogar", icon: <HomeOutlinedIcon /> },
  { id: "health", label: "Salud", icon: <MedicalServicesOutlinedIcon /> },
  { id: "study", label: "Educación", icon: <SchoolOutlinedIcon /> },
  { id: "general", label: "Compras", icon: <ShoppingBagOutlinedIcon /> },
];

const getReserveIcon = (iconName) => {
  switch (iconName) {
    case "travel":
      return <BeachAccessOutlinedIcon />;
    case "car":
      return <DirectionsCarOutlinedIcon />;
    case "home":
      return <HomeOutlinedIcon />;
    case "health":
      return <MedicalServicesOutlinedIcon />;
    case "study":
      return <SchoolOutlinedIcon />;
    case "general":
      return <ShoppingBagOutlinedIcon />;
    default:
      return <SavingsOutlinedIcon />;
  }
};

export function ReservesPage() {
  const { account, refreshAccount } = useAccount();
  const [reserves, setReserves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReserve, setSelectedReserve] = useState(null);

  // Form States
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("savings");
  const [amountInput, setAmountInput] = useState("");

  const accountBalance = account?.money ?? 0;

  const totalReserved = useMemo(() => {
    return reserves.reduce((acc, r) => acc + (r.currentBalance || 0), 0);
  }, [reserves]);

  const fetchReserves = async () => {
    try {
      setLoading(true);
      const data = await getReserves();
      setReserves(data || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error al cargar las reservas.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReserves();
  }, []);

  // Handlers
  const handleOpenCreate = () => {
    setName("");
    setTargetAmount("");
    setSelectedIcon("savings");
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      setActionLoading(true);
      const payload = {
        name: name.trim(),
        targetAmount: targetAmount ? Number(targetAmount) : null,
        icon: selectedIcon,
        color: "#0056D2",
      };
      await createReserve(payload);
      setSnackbar({ open: true, message: "¡Reserva creada exitosamente!", severity: "success" });
      setCreateDialogOpen(false);
      await fetchReserves();
      refreshAccount();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error al crear la reserva.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeposit = (reserve) => {
    setSelectedReserve(reserve);
    setAmountInput("");
    setDepositDialogOpen(true);
  };

  const handleDeposit = async () => {
    const num = Number(amountInput);
    if (!num || num <= 0 || !selectedReserve) return;
    try {
      setActionLoading(true);
      await depositIntoReserve(selectedReserve.id, num);
      setSnackbar({ open: true, message: `Se ingresaron ${formatCurrency(num)} a la reserva.`, severity: "success" });
      setDepositDialogOpen(false);
      await fetchReserves();
      refreshAccount();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error al ingresar dinero a la reserva.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenWithdraw = (reserve) => {
    setSelectedReserve(reserve);
    setAmountInput("");
    setWithdrawDialogOpen(true);
  };

  const handleWithdraw = async () => {
    const num = Number(amountInput);
    if (!num || num <= 0 || !selectedReserve) return;
    try {
      setActionLoading(true);
      await withdrawFromReserve(selectedReserve.id, num);
      setSnackbar({ open: true, message: `Se transfirieron ${formatCurrency(num)} a tu cuenta.`, severity: "success" });
      setWithdrawDialogOpen(false);
      await fetchReserves();
      refreshAccount();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error al retirar dinero de la reserva.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDelete = (reserve) => {
    setSelectedReserve(reserve);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedReserve) return;
    try {
      setActionLoading(true);
      await deleteReserve(selectedReserve.id);
      setSnackbar({ open: true, message: "Reserva eliminada. El saldo restante fue reintegrado a tu cuenta.", severity: "success" });
      setDeleteDialogOpen(false);
      await fetchReserves();
      refreshAccount();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error al eliminar la reserva.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout maxWidth={1000}>
      <Box sx={{ maxWidth: 960, mx: "auto", width: "100%", pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", fontSize: { xs: "1.5rem", md: "1.75rem" } }}>
              Mis Reservas y Apartados
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>
              Separa dinero de tu saldo habitual para tus metas o emergencias. Puedes gastarlo directamente en transferencias o servicios.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              bgcolor: "#0056D2",
              color: "#FFF",
              borderRadius: "12px",
              px: 2.5,
              py: 1.2,
              fontWeight: 700,
              fontSize: "0.9rem",
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(0, 86, 210, 0.25)",
              "&:hover": { bgcolor: "#0047b3" },
            }}
          >
            Nueva Reserva
          </Button>
        </Box>

        {/* Balance Overview Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
            gap: 2,
            mb: 3.5,
          }}
        >
          {/* Card 1: Saldo en Cuenta */}
          <Card
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: "16px",
              bgcolor: "background.paper",
              border: "1px solid", borderColor: "divider",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AccountBalanceWalletOutlinedIcon sx={{ color: "#0056D2", fontSize: "1.2rem" }} />
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "text.secondary" }}>
                SALDO EN CUENTA
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "text.primary" }}>
              {formatCurrency(accountBalance)}
            </Typography>
            <Typography sx={{ fontSize: "0.74rem", color: "#94A3B8", mt: 0.4 }}>
              Disponible para gastos del día
            </Typography>
          </Card>

          {/* Card 2: Total en Reservas */}
          <Card
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: "16px",
              bgcolor: "background.paper",
              border: "1px solid", borderColor: "divider",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <SavingsOutlinedIcon sx={{ color: "#10B981", fontSize: "1.2rem" }} />
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "text.secondary" }}>
                TOTAL EN RESERVAS
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#10B981" }}>
              {formatCurrency(totalReserved)}
            </Typography>
            <Typography sx={{ fontSize: "0.74rem", color: "#94A3B8", mt: 0.4 }}>
              {reserves.length} {reserves.length === 1 ? "apartado activo" : "apartados activos"}
            </Typography>
          </Card>

          {/* Card 3: Saldo Total Global */}
          <Card
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: "16px",
              bgcolor: "#0056D2",
              color: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(0, 86, 210, 0.25)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CheckCircleOutlinedIcon sx={{ color: "#93C5FD", fontSize: "1.2rem" }} />
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#BFDBFE" }}>
                PATRIMONIO TOTAL
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF" }}>
              {formatCurrency(accountBalance + totalReserved)}
            </Typography>
            <Typography sx={{ fontSize: "0.74rem", color: "#DBEAFE", mt: 0.4 }}>
              Cuenta + Todas las Reservas
            </Typography>
          </Card>
        </Box>

        {/* Content Section: Reserves Grid or Empty State */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} sx={{ color: "#0056D2" }} />
          </Box>
        ) : reserves.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              p: 5,
              borderRadius: "20px",
              bgcolor: "background.paper",
              border: "1px dashed #CBD5E1",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                bgcolor: "#EFF6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0056D2",
              }}
            >
              <SavingsOutlinedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Box sx={{ maxWidth: 460 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
                No tienes reservas creadas todavía
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", mb: 2.5 }}>
                Crea tu primer apartado para separar fondos con un objetivo (vacaciones, fondo de emergencia, cuotas o compras).
                Tu saldo de reservas estará protegido y podrás seleccionarlo directamente cuando transfieras dinero o pagues servicios.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                sx={{
                  bgcolor: "#0056D2",
                  color: "#FFF",
                  borderRadius: "12px",
                  px: 3,
                  py: 1.2,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0047b3" },
                }}
              >
                Crear mi primera reserva
              </Button>
            </Box>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2.5,
            }}
          >
            {reserves.map((reserve) => {
              const hasTarget = reserve.targetAmount && reserve.targetAmount > 0;
              const progressPct = hasTarget
                ? Math.min(100, Math.round((reserve.currentBalance / reserve.targetAmount) * 100))
                : 0;

              return (
                <motion.div
                  key={reserve.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: "18px",
                      bgcolor: "background.paper",
                      border: "1px solid", borderColor: "divider",
                      boxShadow: "0 4px 16px -4px rgba(15, 23, 42, 0.05)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 2,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px -6px rgba(0, 86, 210, 0.12)",
                      },
                    }}
                  >
                    {/* Header of the Reserve Card */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            bgcolor: "#EFF6FF",
                            color: "#0056D2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getReserveIcon(reserve.icon)}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "text.primary" }}>
                            {reserve.name}
                          </Typography>
                          <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                            Creada el {new Date(reserve.createdAt).toLocaleDateString("es-AR")}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDelete(reserve)}
                        sx={{ color: "#94A3B8", "&:hover": { color: "#EF4444" } }}
                        title="Eliminar reserva"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Balance and Progress */}
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "text.secondary", mb: 0.3 }}>
                        SALDO RESERVADO
                      </Typography>
                      <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, color: "text.primary" }}>
                        {formatCurrency(reserve.currentBalance)}
                      </Typography>

                      {hasTarget && (
                        <Box sx={{ mt: 1.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                              Meta: {formatCurrency(reserve.targetAmount)}
                            </Typography>
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#0056D2" }}>
                              {progressPct}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progressPct}
                            sx={{
                              height: 7,
                              borderRadius: 4,
                              bgcolor: "action.hover",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: progressPct >= 100 ? "#10B981" : "#0056D2",
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDeposit(reserve)}
                        sx={{
                          borderRadius: "10px",
                          borderColor: "#0056D2",
                          color: "#0056D2",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          textTransform: "none",
                          "&:hover": { bgcolor: "#EFF6FF", borderColor: "#0056D2" },
                        }}
                      >
                        Ingresar
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<RemoveIcon />}
                        disabled={reserve.currentBalance <= 0}
                        onClick={() => handleOpenWithdraw(reserve)}
                        sx={{
                          borderRadius: "10px",
                          borderColor: "#CBD5E1",
                          color: "text.secondary",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          textTransform: "none",
                          "&:hover": { bgcolor: "action.hover", borderColor: "#94A3B8" },
                        }}
                      >
                        Retirar
                      </Button>
                    </Box>
                  </Card>
                </motion.div>
              );
            })}
          </Box>
        )}

        {/* DIALOG 1: CREAR RESERVA */}
        <Dialog
          open={createDialogOpen}
          onClose={() => !actionLoading && setCreateDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "text.primary" }}>
              Nueva Reserva de Dinero
            </Typography>
            <IconButton size="small" onClick={() => setCreateDialogOpen(false)} disabled={actionLoading}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.2, pt: 1 }}>
            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                Nombre del apartado *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="ej: Vacaciones en Brasil, Auto nuevo, Emergencias"
                value={name}
                onChange={(e) => setName(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: "10px" } } }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                Meta de ahorro estimada (opcional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="$ 0,00"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: "10px" } } }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "text.primary", mb: 0.8 }}>
                Icono de categoría
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {ICON_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.id}
                    icon={opt.icon}
                    label={opt.label}
                    onClick={() => setSelectedIcon(opt.id)}
                    variant={selectedIcon === opt.id ? "filled" : "outlined"}
                    sx={{
                      borderRadius: "10px",
                      fontWeight: selectedIcon === opt.id ? 700 : 500,
                      bgcolor: selectedIcon === opt.id ? "#0056D2" : "transparent",
                      color: selectedIcon === opt.id ? "#FFFFFF" : "text.secondary",
                      borderColor: selectedIcon === opt.id ? "#0056D2" : "divider",
                      "& .MuiChip-icon": {
                        color: selectedIcon === opt.id ? "#FFFFFF" : "#0056D2",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setCreateDialogOpen(false)}
              disabled={actionLoading}
              sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!name.trim() || actionLoading}
              sx={{
                bgcolor: "#0056D2",
                color: "#FFF",
                borderRadius: "10px",
                px: 2.5,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#0047b3" },
              }}
            >
              {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Crear Reserva"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG 2: INGRESAR DINERO A RESERVA */}
        <Dialog
          open={depositDialogOpen}
          onClose={() => !actionLoading && setDepositDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "text.primary" }}>
              Ingresar dinero a {selectedReserve?.name}
            </Typography>
            <IconButton size="small" onClick={() => setDepositDialogOpen(false)} disabled={actionLoading}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ p: 1.5, bgcolor: "#EFF6FF", borderRadius: "12px", border: "1px solid #BFDBFE" }}>
              <Typography sx={{ fontSize: "0.78rem", color: "#1E3A8A" }}>
                Saldo disponible en cuenta corriente: <strong>{formatCurrency(accountBalance)}</strong>
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                Monto a apartar
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="$ 0,00"
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                slotProps={{
                  input: {
                    sx: { borderRadius: "10px", fontSize: "1.2rem", fontWeight: 700 },
                  },
                }}
              />
            </Box>

            {/* Quick Amounts */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {[1000, 5000, 10000, 20000].map((quick) => (
                <Chip
                  key={quick}
                  label={`+ ${formatCurrency(quick)}`}
                  size="small"
                  onClick={() => setAmountInput(String((Number(amountInput) || 0) + quick))}
                  sx={{ borderRadius: "8px", fontWeight: 600, bgcolor: "action.hover", color: "text.primary" }}
                />
              ))}
              {accountBalance > 0 && (
                <Chip
                  label="Todo el saldo"
                  size="small"
                  onClick={() => setAmountInput(String(accountBalance))}
                  sx={{ borderRadius: "8px", fontWeight: 700, bgcolor: "#DBEAFE", color: "#1D4ED8" }}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDepositDialogOpen(false)}
              disabled={actionLoading}
              sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleDeposit}
              disabled={
                !amountInput ||
                Number(amountInput) <= 0 ||
                Number(amountInput) > accountBalance ||
                actionLoading
              }
              sx={{
                bgcolor: "#0056D2",
                color: "#FFF",
                borderRadius: "10px",
                px: 2.5,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#0047b3" },
              }}
            >
              {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Confirmar Ingreso"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG 3: RETIRAR DINERO HACIA CUENTA */}
        <Dialog
          open={withdrawDialogOpen}
          onClose={() => !actionLoading && setWithdrawDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "text.primary" }}>
              Retirar dinero de {selectedReserve?.name}
            </Typography>
            <IconButton size="small" onClick={() => setWithdrawDialogOpen(false)} disabled={actionLoading}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ p: 1.5, bgcolor: "#F0FDF4", borderRadius: "12px", border: "1px solid #BBF7D0" }}>
              <Typography sx={{ fontSize: "0.78rem", color: "#166534" }}>
                Saldo disponible en esta reserva: <strong>{formatCurrency(selectedReserve?.currentBalance || 0)}</strong>
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#15803D", mt: 0.3 }}>
                El dinero retirado volverá inmediatamente a tu cuenta principal.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                Monto a retirar
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="$ 0,00"
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                slotProps={{
                  input: {
                    sx: { borderRadius: "10px", fontSize: "1.2rem", fontWeight: 700 },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {selectedReserve?.currentBalance > 0 && (
                <Chip
                  label="Retirar todo el saldo de la reserva"
                  size="small"
                  onClick={() => setAmountInput(String(selectedReserve.currentBalance))}
                  sx={{ borderRadius: "8px", fontWeight: 700, bgcolor: "#DCFCE7", color: "#15803D" }}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setWithdrawDialogOpen(false)}
              disabled={actionLoading}
              sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleWithdraw}
              disabled={
                !amountInput ||
                Number(amountInput) <= 0 ||
                Number(amountInput) > (selectedReserve?.currentBalance || 0) ||
                actionLoading
              }
              sx={{
                bgcolor: "#0056D2",
                color: "#FFF",
                borderRadius: "10px",
                px: 2.5,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#0047b3" },
              }}
            >
              {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Confirmar Retiro"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG 4: CONFIRMAR ELIMINACIÓN */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => !actionLoading && setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, fontSize: "1.15rem", color: "text.primary", pb: 1 }}>
            ¿Eliminar reserva "{selectedReserve?.name}"?
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>
              {selectedReserve?.currentBalance > 0 ? (
                <>
                  Esta reserva tiene un saldo de{" "}
                  <strong style={{ color: "text.primary" }}>
                    {formatCurrency(selectedReserve.currentBalance)}
                  </strong>
                  . Al eliminarla, este monto será reintegrado automáticamente a tu cuenta principal.
                </>
              ) : (
                "Esta reserva se eliminará de forma permanente."
              )}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
              sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={actionLoading}
              sx={{
                borderRadius: "10px",
                px: 2.5,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Eliminar"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Global Feedback Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            sx={{ borderRadius: "12px", fontWeight: 600 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppLayout>
  );
}

export default ReservesPage;
