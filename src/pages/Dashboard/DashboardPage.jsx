import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import MobileBottomNav from "../../components/layout/MobileBottomNav";
import BalanceCard from "../../components/dashboard/BalanceCard";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivity from "../../components/dashboard/RecentActivity";
import accountService from "../../services/accountService";
import transactionService from "../../services/transactionService";

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState({ money: 45230.50, cardNumber: "4892", trend: 2.4 });
  const [transactions, setTransactions] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [activeMobileNav, setActiveMobileNav] = useState(0);
  const [userName] = useState("Alejandro Silva");

  // Estado para modales de acciones directas
  const [depositOpen, setDepositOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [destinationAccount, setDestinationAccount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Consumir en paralelo GET /api/accounts/me y GET /api/transactions/me
      const [accountData, txData] = await Promise.all([
        accountService.getMyAccount(),
        transactionService.getRecentTransactions(5),
      ]);

      if (accountData) {
        setAccount({
          money: accountData.money ?? 45230.50,
          cardNumber: accountData.cardNumber || "4892",
          trend: accountData.trend ?? 2.4,
        });
      }

      if (txData) {
        setTransactions(txData);
      }
    } catch (err) {
      console.error("Error cargando datos del dashboard:", err);
      setError("No se pudieron actualizar los datos en tiempo real. Mostrando último estado conocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Manejador de Depósito rápido
  const handleConfirmDeposit = async () => {
    const num = Number(depositAmount);
    if (!num || num <= 0) return;

    setActionLoading(true);
    try {
      await accountService.deposit(num);
      setAccount((prev) => ({ ...prev, money: prev.money + num }));
      setTransactions((prev) => [
        {
          id: Date.now(),
          title: "Depósito de Fondos",
          subtitle: "Hoy " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · INGRESO",
          amount: num,
          type: 1,
          category: "INGRESO",
        },
        ...prev.slice(0, 4),
      ]);
      setDepositOpen(false);
      setDepositAmount("");
      setSnackbar({ open: true, message: `¡Depósito de $${num.toLocaleString("es-AR")} exitoso!`, severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Error al realizar depósito", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // Manejador de Transferencia rápida
  const handleConfirmTransfer = async () => {
    const num = Number(transferAmount);
    if (!num || num <= 0 || !destinationAccount) return;

    setActionLoading(true);
    try {
      setAccount((prev) => ({ ...prev, money: Math.max(0, prev.money - num) }));
      setTransactions((prev) => [
        {
          id: Date.now(),
          title: `Transferencia a Cuenta #${destinationAccount}`,
          subtitle: "Hoy " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · EGRESO",
          amount: num,
          type: 3,
          category: "EGRESO",
        },
        ...prev.slice(0, 4),
      ]);
      setTransferOpen(false);
      setTransferAmount("");
      setDestinationAccount("");
      setSnackbar({ open: true, message: `¡Transferencia de $${num.toLocaleString("es-AR")} enviada!`, severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Error al transferir", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", pb: { xs: 12, md: 6 } }}>
      {/* Barra de Navegación Superior */}
      <DashboardNavbar
        currentTab={currentTab}
        onTabChange={(e, val) => setCurrentTab(val)}
        userName={userName}
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 2.5, sm: 4 } }}>
        {/* Mensaje de Error si falla la conexión */}
        {error && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: "12px" }}
            action={
              <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={loadDashboardData}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Saludo y Título de Bienvenida (Exacto de Figma) */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "#64748B",
              fontWeight: 600,
              fontSize: "0.85rem",
              letterSpacing: "0.02em",
              mb: 0.25,
            }}
          >
            Bienvenido de nuevo
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#0F172A",
              fontSize: { xs: "1.75rem", sm: "2.1rem" },
              letterSpacing: "-0.02em",
            }}
          >
            {userName}
          </Typography>
        </Box>

        {/* Layout Principal Dividido en Dos Columnas */}
        <Grid container spacing={3.5}>
          {/* Columna Izquierda: Tarjeta de Saldo y Acciones Rápidas */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Tarjeta Destacada de Saldo */}
              <BalanceCard
                balance={account.money}
                cardNumber={account.cardNumber}
                trend={account.trend}
                loading={loading}
              />

              {/* Accesos Directos (Depositar, Transferir, Escanear, Servicios) */}
              <QuickActions
                onDeposit={() => setDepositOpen(true)}
                onTransfer={() => setTransferOpen(true)}
                onScan={() => setSnackbar({ open: true, message: "Módulo Escanear QR próximamente disponible.", severity: "info" })}
                onServices={() => setSnackbar({ open: true, message: "Módulo Pago de Servicios próximamente disponible.", severity: "info" })}
              />
            </Box>
          </Grid>

          {/* Columna Derecha: Actividad Reciente (Últimos 5 movimientos) */}
          <Grid item xs={12} md={5}>
            <RecentActivity
              transactions={transactions}
              loading={loading}
              onViewAll={() => setSnackbar({ open: true, message: "Navegando al historial completo de movimientos...", severity: "info" })}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Navegación Móvil Inferior (Bottom Navigation) */}
      <MobileBottomNav
        activeNav={activeMobileNav}
        onChange={(e, val) => setActiveMobileNav(val)}
      />

      {/* Modal / Dialog Rápido para Depositar */}
      <Dialog open={depositOpen} onClose={() => setDepositOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Depositar Fondos</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ingresa el monto que deseas acreditar a tu cuenta DigitalArs.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label="Monto"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDepositOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDeposit}
            disabled={actionLoading || !depositAmount}
            sx={{ bgcolor: "#0056D2", fontWeight: 700 }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Confirmar Depósito"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal / Dialog Rápido para Transferir */}
      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Transferir Dinero</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ingresa la cuenta destino y el monto a enviar.
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="ID de Cuenta Destino"
            value={destinationAccount}
            onChange={(e) => setDestinationAccount(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Monto a Transferir"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTransferOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmTransfer}
            disabled={actionLoading || !transferAmount || !destinationAccount}
            sx={{ bgcolor: "#0056D2", fontWeight: 700 }}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Confirmar Envío"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}

export default DashboardPage;
