import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Drawer,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import MobileBottomNav from "./MobileBottomNav";
import NotificationPopover from "../common/NotificationPopover";
import notificationService from "../../services/notificationService";
import { useAccount } from "../../hooks/useAccount";
import { useAuth } from "../../context/AuthContext";
import iconoSmall from "../../assets/icono.png";

/**
 * AppLayout: Contenedor estructural unificado de la aplicación (Desktop + Mobile).
 * Conecta la barra lateral y la barra inferior móvil con la navegación del router,
 * incorporando menú hamburguesa deslizante para mobile.
 */
export function AppLayout({
  children,
  activeSidebarItem,
  currentTab = 0,
  onTabChange,
  showNavbarTabs,
  onBack,
  backLabel = "Volver",
  maxWidth = 1240,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { user, refreshAccount, refreshTransactions } = useAccount();
  const { logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileNotificationsAnchor, setMobileNotificationsAnchor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = React.useCallback(async () => {
    try {
      const count = await notificationService.getUnreadNotificationCount();
      setUnreadCount(count || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  // Sincronización automática de saldo, historial y notificaciones al cambiar de sección
  useEffect(() => {
    refreshAccount();
    refreshTransactions();
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [location.pathname, refreshAccount, refreshTransactions, fetchUnread]);

  // Determinar ítem activo según la ruta actual
  const path = location.pathname.toLowerCase();
  let currentActiveItem = activeSidebarItem;
  let currentMobileIndex = 0;

  if (path === "/" || path === "/dashboard") {
    currentActiveItem = "inicio";
    currentMobileIndex = 0;
  } else if (path.startsWith("/services") || path.startsWith("/servicios")) {
    currentActiveItem = "servicios";
  } else if (path.startsWith("/reserves") || path.startsWith("/reservas")) {
    currentActiveItem = "reservas";
  } else if (path.startsWith("/history") || path.startsWith("/historial")) {
    currentActiveItem = "historial";
    currentMobileIndex = 1;
  } else if (path.startsWith("/investments") || path.startsWith("/inversiones")) {
    currentActiveItem = "inversiones";
  } else if (path.startsWith("/cards") || path.startsWith("/tarjetas")) {
    currentActiveItem = "tarjetas";
  } else if (path.startsWith("/profile") || path.startsWith("/perfil")) {
    currentActiveItem = "perfil";
    currentMobileIndex = 2;
  } else if (path.startsWith("/settings") || path.startsWith("/configuracion")) {
    currentActiveItem = "configuracion";
  } else if (path.startsWith("/admin")) {
    currentActiveItem = "admin";
  } else if (path.startsWith("/help") || path.startsWith("/ayuda")) {
    currentActiveItem = "ayuda";
  } else if (path.startsWith("/support") || path.startsWith("/soporte")) {
    currentActiveItem = "soporte";
  } else if (!currentActiveItem) {
    currentActiveItem = "inicio";
  }

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const handleSidebarClick = (item) => {
    setMobileDrawerOpen(false);
    if (item === "inicio") navigate(isAdmin ? "/admin" : "/");
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

  const handleDefaultTabChange = (e, val) => {
    if (val === 0) navigate("/dashboard");
    else if (val === 1) navigate("/investments");
  };

  const handleMobileNavChange = (e, index) => {
    if (index === 0) navigate("/");
    else if (index === 1) navigate("/history");
    else if (index === 2) navigate("/profile");
    else if (index === 3) navigate("/profile");
  };

  const handleLogout = () => {
    setMobileDrawerOpen(false);
    logout();
    navigate("/login");
  };

  const userName = user?.name || "Usuario";

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", bgcolor: "background.default" }}>
      {/* Enlace para lectores de pantalla para saltar directamente al contenido */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      {/* 1. Vista Desktop: Barra Lateral Fija */}
      {isDesktop && (
        <Sidebar
          activeItem={currentActiveItem}
          onItemClick={handleSidebarClick}
          onLogout={handleLogout}
        />
      )}

      {/* 2. Menú Lateral Deslizable para Mobile (Slide Drawer) */}
      {!isDesktop && (
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          slotProps={{
            paper: {
              sx: {
                bgcolor: "#02122c",
                backgroundImage: "none",
                border: "none",
                width: 280,
                maxHeight: "100dvh",
                height: "100%",
                overflow: "hidden",
                boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
              },
            },
          }}
        >
          <Sidebar
            activeItem={currentActiveItem}
            onItemClick={handleSidebarClick}
            onLogout={handleLogout}
            onClose={() => setMobileDrawerOpen(false)}
            isMobileDrawer
          />
        </Drawer>
      )}

      {/* 3. Contenedor Principal Scrollable */}
      <Box
        component="main"
        id="main-content"
        tabIndex="-1"
        role="main"
        aria-label="Contenido principal"
        sx={{
          flex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          bgcolor: "background.default",
          pb: { xs: 10, md: 4 },
          outline: "none",
        }}
      >
        {/* Navbar Superior (Desktop) */}
        {isDesktop && (
          <DashboardNavbar
            currentTab={currentTab}
            onTabChange={onTabChange || handleDefaultTabChange}
            userName={userName}
            showTabs={showNavbarTabs}
          />
        )}

        {/* Barra Superior Mobile con Menú Hamburguesa y Cierre de Sesión */}
        {!isDesktop && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              bgcolor: "#02122c",
              color: "#FFFFFF",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              position: "sticky",
              top: 0,
              zIndex: 1100,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                aria-label="Abrir menú de navegación"
                sx={{
                  color: "#FFFFFF",
                  p: 0.8,
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Box
                onClick={() => navigate(isAdmin ? "/admin" : "/")}
                sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
              >
                <Box
                  component="img"
                  src={iconoSmall}
                  alt="DigitalArs"
                  sx={{ width: 32, height: 32, borderRadius: "8px", objectFit: "contain" }}
                />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.01em" }}>
                  DigitalArs
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <IconButton
                onClick={(e) => setMobileNotificationsAnchor(e.currentTarget)}
                aria-label="Ver notificaciones"
                sx={{
                  color: "#FFFFFF",
                  p: 0.8,
                  bgcolor: Boolean(mobileNotificationsAnchor) ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.08)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  max={9}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#EF4444",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      height: 16,
                      minWidth: 16,
                      top: 1,
                      right: 1,
                    },
                  }}
                >
                  <NotificationsNoneOutlinedIcon sx={{ fontSize: "1.25rem" }} />
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

              <Box
                onClick={() => navigate("/profile")}
                sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#D0D9E5",
                    fontWeight: 600,
                    maxWidth: 90,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userName}
                </Typography>
              </Box>

              <IconButton
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                sx={{
                  color: "#EF4444",
                  p: 0.8,
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" },
                }}
              >
                <LogoutOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Contenido de la Pantalla */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, maxWidth, width: "100%", mx: "auto" }}>
          {/* Botón Volver Opcional */}
          {onBack && (
            <Box sx={{ display: "flex", alignSelf: "flex-start", mb: { xs: 2, md: 3 } }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                aria-label={`Volver: ${backLabel}`}
                sx={{
                  color: (theme) => (theme.palette.mode === "dark" ? "#60A5FA" : "#0056D2"),
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  borderRadius: "10px",
                  px: 2,
                  py: 0.8,
                  "&:hover": {
                    bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(96, 165, 250, 0.15)" : "#EFF6FF"),
                  },
                }}
              >
                {backLabel}
              </Button>
            </Box>
          )}

          {children}
        </Box>
      </Box>

      {/* Barra de Navegación Inferior en Mobile */}
      {!isDesktop && (
        <MobileBottomNav
          currentIndex={currentMobileIndex}
          onChange={handleMobileNavChange}
        />
      )}
    </Box>
  );
}

export default AppLayout;
