import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Snackbar,
  IconButton,
  Badge,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

import { useAccount } from "../../hooks/useAccount";
import Sidebar from "../../components/layout/Sidebar";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import MobileBottomNav from "../../components/layout/MobileBottomNav";
import BalanceCard from "../../components/dashboard/BalanceCard";
import QuickActions from "../../components/dashboard/QuickActions";
import ImageCarousel from "../../components/dashboard/ImageCarousel";

import iconoImg from "../../assets/icono.png";

/**
 * HU-24: Dashboard principal de la billetera virtual.
 * Implementación fiel a Figma con soporte Desktop y Mobile.
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  const { user, account, loading } = useAccount();
  const [currentTab, setCurrentTab] = useState(0);
  const [activeSidebarItem, setActiveSidebarItem] = useState("inicio");
  const [activeMobileNav, setActiveMobileNav] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const userName = user?.name || "Alejandro Silva";

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
              setSnackbar({ open: true, message: `Navegando a ${item.toUpperCase()}...` });
            }}
            onLogout={() => setSnackbar({ open: true, message: "Sesión finalizada." })}
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
                    trend={account.trend}
                    loading={loading}
                  />
                  <QuickActions
                    onDeposit={() => navigate("/deposit")}
                    onTransfer={() => navigate("/transfer")}
                    onScan={() => setSnackbar({ open: true, message: "Módulo Escanear QR próximamente disponible." })}
                    onServices={() => setSnackbar({ open: true, message: "Módulo Pago de Servicios próximamente disponible." })}
                  />
                </Box>

                {/* Columna Derecha: Carrusel Promocional 1:1 */}
                <Box sx={{ width: "100%", aspectRatio: "1 / 1", alignSelf: "flex-start" }}>
                  <ImageCarousel
                    height="100%"
                    borderRadius="20px"
                    onTransfer={() => navigate("/transfer")}
                    onInvestments={() => setCurrentTab(1)}
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
            {/* Cabecera DigitalArs + Notificaciones */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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

          {/* Sección Inferior Blanca con Esquinas Redondeadas */}
          <Box
            sx={{
              flex: 1,
              bgcolor: "#FFFFFF",
              borderRadius: "28px 28px 0 0",
              px: 2.5,
              pt: 3,
              pb: 12,
            }}
          >
            {/* Acciones Rápidas (2x2 Grid) */}
            <Box sx={{ mb: 3.5 }}>
              <QuickActions
                onDeposit={() => navigate("/deposit")}
                onTransfer={() => navigate("/transfer")}
                onScan={() => setSnackbar({ open: true, message: "Módulo Escanear QR próximamente disponible." })}
                onServices={() => setSnackbar({ open: true, message: "Módulo Pago de Servicios próximamente disponible." })}
              />
            </Box>

            {/* Carrusel de imágenes */}
            <Box sx={{ borderRadius: "20px", overflow: "hidden", height: 380 }}>
              <ImageCarousel
                height="380px"
                borderRadius="20px"
                onTransfer={() => navigate("/transfer")}
                onInvestments={() => setCurrentTab(1)}
              />
            </Box>
          </Box>

          {/* Barra Fija Inferior Mobile */}
          <MobileBottomNav
            activeNav={activeMobileNav}
            onChange={(e, val) => setActiveMobileNav(val)}
          />
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
