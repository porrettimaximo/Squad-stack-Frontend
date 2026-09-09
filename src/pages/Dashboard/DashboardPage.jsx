import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Snackbar,
  IconButton,
  Badge,
  Drawer,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MenuIcon from "@mui/icons-material/Menu";

import { useAccount } from "../../hooks/useAccount";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import BalanceCard from "../../components/dashboard/BalanceCard";
import QuickActions from "../../components/dashboard/QuickActions";
import ImageCarousel from "../../components/dashboard/ImageCarousel";
import NotificationPopover from "../../components/common/NotificationPopover";
import notificationService from "../../services/notificationService";

import iconoImg from "../../assets/icono.png";

/**
 * HU-24: Dashboard principal de la billetera virtual.
 * Implementación fiel a Figma con soporte Desktop y Mobile.
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  const { user, account, loading, refreshAccount, refreshTransactions } = useAccount();
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileNotificationsAnchor, setMobileNotificationsAnchor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const fetchUnread = React.useCallback(async () => {
    try {
      const count = await notificationService.getUnreadNotificationCount();
      setUnreadCount(count || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    if (user?.role?.toLowerCase() === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    refreshAccount();
    refreshTransactions();
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user, navigate, refreshAccount, refreshTransactions, fetchUnread]);

  const handleSidebarClick = (item) => {
    setMobileDrawerOpen(false);
    if (item === "inicio") navigate("/");
    else if (item === "servicios") navigate("/services");
    else if (item === "reservas") navigate("/reserves");
    else if (item === "historial") navigate("/history");
    else if (item === "inversiones") navigate("/investments");
    else if (item === "tarjetas") navigate("/cards");
    else if (item === "perfil") navigate("/profile");
    else if (item === "configuracion") navigate("/settings");
    else if (item === "admin" || item === "admin-users") navigate("/admin");
    else if (item === "ayuda") navigate("/help");
    else if (item === "soporte") navigate("/support");
  };

  const handleLogout = () => {
    setMobileDrawerOpen(false);
    logout();
    navigate("/login");
  };

  const userName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.email || "Usuario");

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", bgcolor: "background.default" }}>
      {/* ─── 1. VISTA DESKTOP (md y superior) ─── */}
      {isDesktop ? (
        <>
          {/* Barra Lateral Izquierda */}
          <Sidebar
            activeItem="inicio"
            onItemClick={handleSidebarClick}
            onLogout={handleLogout}
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
              bgcolor: "background.default",
              pb: 4,
            }}
          >
            {/* Barra de Navegación Superior Desktop */}
            <DashboardNavbar
              currentTab={currentTab}
              onTabChange={(e, val) => {
                setCurrentTab(val);
                if (val === 1) navigate("/investments");
                else if (val === 0) navigate("/dashboard");
              }}
              userName={userName}
            />

            {/* Contenedor del Dashboard Desktop */}
            <Box sx={{ flex: 1, p: 4, maxWidth: 1240, width: "100%", mx: "auto" }}>
              {/* Saludo */}
              <Box sx={{ mb: 3.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
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
                    color: "text.primary",
                    fontSize: "2.1rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {userName}
                </Typography>
              </Box>

              {/* Grid Desktop de 2 Columnas: Columna Izquierda (Saldo + Acciones) + Columna Derecha (Carrusel) */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1.18fr 0.82fr" },
                  gap: 3.5,
                  alignItems: "stretch",
                }}
              >
                {/* Columna Izquierda */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <BalanceCard
                    balance={account.money}
                    cardNumber={account.cardNumber}
                    cvu={account.cvu || (account.id ? `000000310001000000000${account.id}` : "0000003100010000000004")}
                    trend={account.trend}
                    loading={loading}
                    onInvestments={() => navigate("/investments")}
                  />
                  <QuickActions
                    onDeposit={() => navigate("/deposit")}
                    onTransfer={() => navigate("/transfer")}
                    onReserves={() => navigate("/reserves")}
                    onServices={() => navigate("/services")}
                  />
                </Box>

                {/* Columna Derecha: Carrusel Promocional 1:1 */}
                <Box sx={{ width: "100%", aspectRatio: "1 / 1", alignSelf: "flex-start" }}>
                  <ImageCarousel
                    height="100%"
                    borderRadius="20px"
                    onTransfer={() => navigate("/transfer")}
                    onInvestments={() => navigate("/investments")}
                  />
                </Box>
              </Box>
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
            bgcolor: "#001639",
          }}
        >
          {/* Sección Superior Azul Oscura */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 3, bgcolor: "#001639", color: "#FFFFFF" }}>
            {/* Cabecera DigitalArs + Notificaciones + Menú Hamburguesa */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <IconButton
                  onClick={() => setMobileDrawerOpen(true)}
                  aria-label="Abrir menú de navegación"
                  sx={{
                    bgcolor: "#0d2650",
                    color: "#FFFFFF",
                    width: 44,
                    height: 44,
                    "&:hover": { bgcolor: "#133368" },
                  }}
                >
                  <MenuIcon />
                </IconButton>
                <Box
                  component="img"
                  src={iconoImg}
                  alt="DigitalArs Logo"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    objectFit: "contain",
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.35rem", letterSpacing: "-0.01em" }}>
                  DigitalArs
                </Typography>
              </Box>

              {/* Botón Circular de Notificaciones Mobile */}
              <IconButton
                onClick={(e) => setMobileNotificationsAnchor(e.currentTarget)}
                aria-label="Ver notificaciones"
                sx={{
                  bgcolor: Boolean(mobileNotificationsAnchor) ? "#133368" : "#0d2650",
                  width: 44,
                  height: 44,
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "#133368" },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  max={9}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#EF4444",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      height: 18,
                      minWidth: 18,
                      top: 2,
                      right: 2,
                    },
                  }}
                >
                  <NotificationsNoneOutlinedIcon sx={{ color: "#FFFFFF", fontSize: "1.35rem" }} />
                </Badge>
              </IconButton>

              <NotificationPopover
                anchorEl={mobileNotificationsAnchor}
                open={Boolean(mobileNotificationsAnchor)}
                onClose={() => {
                  setMobileNotificationsAnchor(null);
                  fetchUnread();
                }}
                onNotificationsChange={fetchUnread}
              />
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
              cvu={account.cvu || (account.id ? `000000310001000000000${account.id}` : "0000003100010000000004")}
              trend={account.trend}
              loading={loading}
              onInvestments={() => navigate("/investments")}
            />
          </Box>

          {/* Sección Inferior Blanca con Esquinas Redondeadas */}
          <Box
            sx={{
              flex: 1,
              bgcolor: "background.paper",
              borderRadius: "28px 28px 0 0",
              px: 2.5,
              pt: 3,
              pb: 4,
            }}
          >
            {/* Acciones Rápidas (2x2 Grid) */}
            <Box sx={{ mb: 3.5 }}>
              <QuickActions
                onDeposit={() => navigate("/deposit")}
                onTransfer={() => navigate("/transfer")}
                onReserves={() => navigate("/reserves")}
                onServices={() => navigate("/services")}
              />
            </Box>

            {/* Carrusel de imágenes */}
            <Box sx={{ borderRadius: "20px", overflow: "hidden", height: 380 }}>
              <ImageCarousel
                height="380px"
                borderRadius="20px"
                onTransfer={() => navigate("/transfer")}
                onInvestments={() => navigate("/investments")}
              />
            </Box>
          </Box>

          {/* Menú Lateral Deslizable para Mobile (Slide Drawer) */}
          <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            disableRestoreFocus
            ModalProps={{ keepMounted: true, disableRestoreFocus: true }}
            slotProps={{
              paper: {
                sx: {
                  bgcolor: "#02122c",
                  backgroundImage: "none",
                  border: "none",
                  width: 280,
                  boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
                },
              },
            }}
          >
            <Sidebar
              activeItem="inicio"
              onItemClick={(item) => {
                setMobileDrawerOpen(false);
                handleSidebarClick(item);
              }}
              onLogout={handleLogout}
              onClose={() => setMobileDrawerOpen(false)}
              isMobileDrawer
            />
          </Drawer>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </Box>
  );
}

export default DashboardPage;
