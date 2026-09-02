import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
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
  IconButton,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

import Sidebar from "../../components/layout/Sidebar";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import MobileBottomNav from "../../components/layout/MobileBottomNav";
import BalanceCard from "../../components/dashboard/BalanceCard";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivity from "../../components/dashboard/RecentActivity";
import accountService from "../../services/accountService";
import transactionService from "../../services/transactionService";

export function DashboardPage() {
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState({ money: 45230.50, cardNumber: "4892", trend: 2.4 });
  const [transactions, setTransactions] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [activeSidebarItem, setActiveSidebarItem] = useState("inicio");
  const [activeMobileNav, setActiveMobileNav] = useState(0);
  const [userName] = useState("Alejandro Silva");

  // Modales de acciones rápidas
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
      console.error("Error cargando dashboard:", err);
      setError("No se pudieron actualizar los datos en tiempo real. Mostrando último estado conocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
      setSnackbar({ open: true, message: err.message || "Error al depositar", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

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
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", bgcolor: "#F8FAFC" }}>
      {/* ─── 1. VISTA DESKTOP (md y superior) ─── */}
      {isDesktop ? (
        <>
          {/* Barra Lateral Izquierda */}
          <Sidebar
            activeItem={activeSidebarItem}
            onItemClick={(item) => {
              setActiveSidebarItem(item);
              setSnackbar({ open: true, message: `Navegando a ${item.toUpperCase()}...`, severity: "info" });
            }}
            onLogout={() => setSnackbar({ open: true, message: "Sesión finalizada.", severity: "info" })}
          />

          {/* Área Central de Contenido */}
          <Box
            component="main"
            sx={{
              flex: 1,
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              bgcolor: "#F8FAFC",
              pb: 4,
            }}
          >
            {/* Barra de Navegación Superior Desktop */}
            <DashboardNavbar
              currentTab={currentTab}
              onTabChange={(e, val) => setCurrentTab(val)}
              userName={userName}
            />

            {/* Contenedor del Dashboard Desktop */}
            <Box sx={{ flex: 1, p: 4, maxWidth: 1240, width: "100%", mx: "auto" }}>
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

              {/* Saludo */}
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
                    fontSize: "2.1rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {userName}
                </Typography>
              </Box>

              {/* Grid Desktop de 2 Columnas */}
              <Grid container spacing={3.5}>
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <BalanceCard
                      balance={account.money}
                      cardNumber={account.cardNumber}
                      trend={account.trend}
                      loading={loading}
                    />
                    <QuickActions
                      onDeposit={() => setDepositOpen(true)}
                      onTransfer={() => setTransferOpen(true)}
                      onScan={() => setSnackbar({ open: true, message: "Módulo Escanear QR próximamente disponible.", severity: "info" })}
                      onServices={() => setSnackbar({ open: true, message: "Módulo Pago de Servicios próximamente disponible.", severity: "info" })}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={5}>
                  <RecentActivity
                    transactions={transactions}
                    loading={loading}
                    onViewAll={() => setSnackbar({ open: true, message: "Navegando al historial completo...", severity: "info" })}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </>
      ) : (
        /* ─── 2. VISTA MOBILE (xs y sm) — Exacta a Figma ─── */
        <Box
          component="main"
          sx={{
            flex: 1,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            bgcolor: "#001639", // Fondo azul oscuro superior
          }}
        >
          {/* Sección Superior Azul Oscura */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 3, bgcolor: "#001639", color: "#FFFFFF" }}>
            {/* Cabecera DigitalArs + Notificaciones */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "12px",
                    bgcolor: "#0d2650",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                  }}
                >
                  <AccountBalanceWalletOutlinedIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.35rem", letterSpacing: "-0.01em" }}>
                  DigitalArs
                </Typography>
              </Box>

              {/* Botón Circular de Notificaciones */}
              <IconButton
                sx={{
                  bgcolor: "#0d2650",
                  width: 44,
                  height: 44,
                  "&:hover": { bgcolor: "#133368" },
                }}
              >
                <Badge
                  color="error"
                  variant="dot"
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#EF4444",
                      top: 4,
                      right: 4,
                    },
                  }}
                >
                  <NotificationsNoneOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "1.35rem" }} />
                </Badge>
              </IconButton>
            </Box>

            {/* Saludo Mobile */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#8FA3BC",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  mb: 0.5,
                }}
              >
                Bienvenido de nuevo
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#FFFFFF",
                  fontSize: "1.75rem",
                  letterSpacing: "-0.02em",
                }}
              >
                {userName}
              </Typography>
            </Box>

            {/* Tarjeta Azul de Saldo */}
            <BalanceCard
              balance={account.money}
              cardNumber={account.cardNumber}
              trend={account.trend}
              loading={loading}
            />
          </Box>

          {/* Sección Inferior Blanca con Esquinas Redondeadas (Curved Bottom Sheet) */}
          <Box
            sx={{
              flex: 1,
              bgcolor: "#FFFFFF",
              borderRadius: "28px 28px 0 0",
              px: 2.5,
              pt: 3,
              pb: 12, // Espacio para la barra de navegación móvil inferior
            }}
          >
            {error && (
              <Alert severity="warning" sx={{ mb: 2.5, borderRadius: "12px" }}>
                {error}
              </Alert>
            )}

            {/* Acciones Rápidas (2x2 Grid) */}
            <Box sx={{ mb: 3.5 }}>
              <QuickActions
                onDeposit={() => setDepositOpen(true)}
                onTransfer={() => setTransferOpen(true)}
                onScan={() => setSnackbar({ open: true, message: "Módulo Escanear QR próximamente disponible.", severity: "info" })}
                onServices={() => setSnackbar({ open: true, message: "Módulo Pago de Servicios próximamente disponible.", severity: "info" })}
              />
            </Box>

            {/* Actividad Reciente (Tarjetas individuales separadas) */}
            <RecentActivity
              transactions={transactions}
              loading={loading}
              onViewAll={() => setSnackbar({ open: true, message: "Navegando al historial completo...", severity: "info" })}
            />
          </Box>

          {/* Barra Fija Inferior Mobile */}
          <MobileBottomNav
            activeNav={activeMobileNav}
            onChange={(e, val) => setActiveMobileNav(val)}
          />
        </Box>
      )}

      {/* ─── Diálogos de Acciones (Comunes para Desktop y Mobile) ─── */}
      <Dialog open={depositOpen} onClose={() => setDepositOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Depositar Fondos</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ingresa el monto a acreditar en tu cuenta DigitalArs.
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

      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Transferir Dinero</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ingresa la cuenta receptora y el monto a enviar.
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}

export default DashboardPage;
