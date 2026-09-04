import React, { useState } from "react";
import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import MobileBottomNav from "./MobileBottomNav";
import { useAccount } from "../../hooks/useAccount";

/**
 * AppLayout: Contenedor estructural unificado de la aplicación (Desktop + Mobile).
 * Elimina la duplicación de código de layout en DashboardPage, DepositPage y TransferPage.
 */
export function AppLayout({
  children,
  activeSidebarItem = "inicio",
  currentTab = 0,
  onTabChange,
  onBack,
  backLabel = "Volver",
  maxWidth = 1240,
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { user } = useAccount();

  const [activeItem, setActiveItem] = useState(activeSidebarItem);
  const [mobileNavIndex, setMobileNavIndex] = useState(0);

  const userName = user?.name || "Alejandro Silva";

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", bgcolor: "#F8FAFC" }}>
      {/* 1. Vista Desktop: Barra Lateral */}
      {isDesktop && (
        <Sidebar
          activeItem={activeItem}
          onItemClick={(item) => setActiveItem(item)}
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
          activeIndex={mobileNavIndex}
          onChange={(index) => setMobileNavIndex(index)}
        />
      )}
    </Box>
  );
}

export default AppLayout;
