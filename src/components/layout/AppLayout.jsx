import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import MobileBottomNav from "./MobileBottomNav";
import { useAccount } from "../../hooks/useAccount";

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

  // Ocultar pestañas de navegación superior en historial y perfil
  const isHistoryRoute = location.pathname.startsWith("/history") || location.pathname.startsWith("/historial");
  const isProfileRoute = location.pathname.startsWith("/profile") || location.pathname.startsWith("/perfil");
  const shouldShowTabs = showNavbarTabs !== undefined ? showNavbarTabs : (!isHistoryRoute && !isProfileRoute);

  // Determinar ítem activo según la ruta actual si no viene explícito
  let currentActiveItem = activeSidebarItem;
  let currentMobileIndex = 0;

  if (isHistoryRoute) {
    currentActiveItem = "historial";
    currentMobileIndex = 1;
  } else if (isProfileRoute) {
    currentActiveItem = "perfil";
    currentMobileIndex = 2;
  } else if (location.pathname === "/") {
    currentActiveItem = "inicio";
    currentMobileIndex = 0;
  }

  const handleSidebarClick = (item) => {
    if (item === "inicio") navigate("/");
    else if (item === "historial") navigate("/history");
    else if (item === "perfil") navigate("/profile");
  };

  const handleMobileNavChange = (e, index) => {
    if (index === 0) navigate("/");
    else if (index === 1) navigate("/history");
    else if (index === 2) navigate("/profile");
  };

  const userName = user?.name || "Alejandro Silva";

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", bgcolor: "#F8FAFC" }}>
      {/* 1. Vista Desktop: Barra Lateral */}
      {isDesktop && (
        <Sidebar
          activeItem={currentActiveItem}
          onItemClick={handleSidebarClick}
          onLogout={() => console.info("Logout")}
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
            currentTab={currentTab}
            onTabChange={onTabChange}
            userName={userName}
            showTabs={shouldShowTabs}
          />
        )}

        {/* Contenido de la Pantalla */}
        <Box sx={{ flex: 1, p: { xs: 2.5, md: 4 }, maxWidth, width: "100%", mx: "auto" }}>
          {/* Botón Volver Opcional */}
          {onBack && (
            <Box sx={{ display: "flex", alignSelf: "flex-start", mb: { xs: 2, md: 3 } }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{
                  color: "#3B82F6",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.05rem",
                  borderRadius: "12px",
                  px: 2,
                  py: 1,
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
