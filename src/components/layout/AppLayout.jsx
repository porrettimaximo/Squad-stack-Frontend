import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import MobileBottomNav from "./MobileBottomNav";
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
  const { user } = useAccount();
  const { logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Ocultar pestañas de navegación superior en historial, perfil, ayuda, soporte, inversiones y tarjetas según corresponda
  const isHistoryRoute = location.pathname.startsWith("/history") || location.pathname.startsWith("/historial");
  const isInvestmentsRoute = location.pathname.startsWith("/investments") || location.pathname.startsWith("/inversiones");
  const isCardsRoute = location.pathname.startsWith("/cards") || location.pathname.startsWith("/tarjetas");
  const isProfileRoute = location.pathname.startsWith("/profile") || location.pathname.startsWith("/perfil");
  const isHelpRoute = location.pathname.startsWith("/help") || location.pathname.startsWith("/ayuda");
  const isSupportRoute = location.pathname.startsWith("/support") || location.pathname.startsWith("/soporte");
  const isDepositOrTransfer = location.pathname.startsWith("/deposit") || location.pathname.startsWith("/transfer");
  const shouldShowTabs = showNavbarTabs !== undefined ? showNavbarTabs : (!isHistoryRoute && !isProfileRoute && !isHelpRoute && !isSupportRoute && !isDepositOrTransfer && !isCardsRoute);

  // Determinar ítem activo según la ruta actual si no viene explícito
  let currentActiveItem = activeSidebarItem;
  let currentMobileIndex = 0;
  let activeNavbarTab = currentTab;

  if (isHistoryRoute) {
    currentActiveItem = "historial";
    currentMobileIndex = 1;
  } else if (isInvestmentsRoute) {
    currentActiveItem = "inversiones";
    activeNavbarTab = 1;
  } else if (isCardsRoute) {
    currentActiveItem = "tarjetas";
  } else if (isProfileRoute) {
    currentActiveItem = "perfil";
    currentMobileIndex = 2;
  } else if (isHelpRoute) {
    currentActiveItem = "ayuda";
  } else if (isSupportRoute) {
    currentActiveItem = "soporte";
  } else if (location.pathname === "/" || location.pathname === "/dashboard") {
    currentActiveItem = "inicio";
    currentMobileIndex = 0;
    activeNavbarTab = 0;
  }

  const handleSidebarClick = (item) => {
    setMobileDrawerOpen(false);
    if (item === "inicio") navigate("/");
    else if (item === "historial") navigate("/history");
    else if (item === "inversiones") navigate("/investments");
    else if (item === "tarjetas") navigate("/cards");
    else if (item === "perfil") navigate("/profile");
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
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", bgcolor: "#F8FAFC" }}>
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
        sx={{
          flex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          bgcolor: "#F8FAFC",
          pb: { xs: 10, md: 4 },
        }}
      >
        {/* Navbar Superior (Desktop) */}
        {isDesktop && (
          <DashboardNavbar
            currentTab={activeNavbarTab}
            onTabChange={onTabChange || handleDefaultTabChange}
            userName={userName}
            showTabs={shouldShowTabs}
          />
        )}

        {/* Barra Superior Mobile con Menú Hamburguesa */}
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
                onClick={() => navigate("/")}
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

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#94A3B8",
                  fontWeight: 600,
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </Typography>
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
                sx={{
                  color: "#0056D2",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  borderRadius: "10px",
                  px: 2,
                  py: 0.8,
                  "&:hover": { bgcolor: "#EFF6FF" },
                }}
              >
                {backLabel}
              </Button>
            </Box>
          )}

          {children}
        </Box>
      </Box>

      {/* 4. Vista Mobile: Barra de Navegación Inferior */}
      {!isDesktop && (
        <MobileBottomNav
          activeNav={currentMobileIndex}
          onChange={handleMobileNavChange}
        />
      )}
    </Box>
  );
}

export default AppLayout;

