import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import MobileBottomNav from "./MobileBottomNav";
import { useAccount } from "../../hooks/useAccount";
import { useAuth } from "../../context/AuthContext";

/**
 * AppLayout: Contenedor estructural unificado de la aplicación (Desktop + Mobile).
 * Conecta la barra lateral y la barra inferior móvil con la navegación del router.
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

  // Ocultar pestañas de navegación superior en historial, perfil, ayuda, soporte e inversiones según corresponda
  const isHistoryRoute = location.pathname.startsWith("/history") || location.pathname.startsWith("/historial");
  const isInvestmentsRoute = location.pathname.startsWith("/investments") || location.pathname.startsWith("/inversiones");
  const isProfileRoute = location.pathname.startsWith("/profile") || location.pathname.startsWith("/perfil");
  const isHelpRoute = location.pathname.startsWith("/help") || location.pathname.startsWith("/ayuda");
  const isSupportRoute = location.pathname.startsWith("/support") || location.pathname.startsWith("/soporte");
  const isDepositOrTransfer = location.pathname.startsWith("/deposit") || location.pathname.startsWith("/transfer");
  const shouldShowTabs = showNavbarTabs !== undefined ? showNavbarTabs : (!isHistoryRoute && !isProfileRoute && !isHelpRoute && !isSupportRoute && !isDepositOrTransfer);

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
    if (item === "inicio") navigate("/");
    else if (item === "historial") navigate("/history");
    else if (item === "inversiones") navigate("/investments");
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
    logout();
    navigate("/login");
  };

  const userName = user?.name || "Usuario";

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", bgcolor: "#F8FAFC" }}>
      {/* 1. Vista Desktop: Barra Lateral */}
      {isDesktop && (
        <Sidebar
          activeItem={currentActiveItem}
          onItemClick={handleSidebarClick}
          onLogout={handleLogout}
        />
      )}

      {/* 2. Contenedor Principal Scrollable */}
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

      {/* 3. Vista Mobile: Barra de Navegación Inferior */}
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

