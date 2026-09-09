import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  Divider,
  Button,
  Avatar,
  Paper,
} from "@mui/material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useThemeMode } from "../../context/ThemeContext";
import { useAccount } from "../../hooks/useAccount";

/**
 * SettingsPage: Pantalla ligera de Ajustes / Configuración.
 * - Conmutador interactivo de Tema (Modo Claro / Modo Oscuro).
 * - Accesos directos para reutilizar lo ya existente: Mi Cuenta / Perfil, Historial de Movimientos, Tarjetas y Seguridad.
 */
export function SettingsPage() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useThemeMode();
  const { user } = useAccount();

  const shortcutLinks = [
    {
      title: "Información de mi Cuenta y Perfil",
      subtitle: "Gestiona tu nombre, apellido, correo y contraseña",
      icon: <PersonOutlineOutlinedIcon sx={{ color: "#0056D2" }} />,
      path: "/profile",
    },
    {
      title: "Historial de Movimientos y Facturas",
      subtitle: "Revisa comprobantes, transferencias y descargas en PDF",
      icon: <HistoryOutlinedIcon sx={{ color: "#10B981" }} />,
      path: "/history",
    },
    {
      title: "Mis Tarjetas",
      subtitle: "Administra tu tarjeta física y virtual DigitalArs",
      icon: <CreditCardOutlinedIcon sx={{ color: "#F59E0B" }} />,
      path: "/cards",
    },
  ];

  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <AppLayout activeSidebarItem="configuracion">
      <Box sx={{ maxWidth: 860, mx: "auto", pb: 6 }}>
        {/* Cabecera */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.6rem", sm: "2rem" },
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            Configuración
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {isAdmin
              ? "Personaliza la apariencia del panel de administración."
              : "Personaliza la apariencia y gestiona las preferencias de tu cuenta DigitalArs."}
          </Typography>
        </Box>

        {/* 1. Apariencia: Modo Claro / Oscuro */}
        <Card
          sx={{
            mb: 3,
            cursor: "pointer",
            transition: "all 0.18s ease",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": { borderColor: "primary.main" },
            "&:focus-within": {
              borderColor: "primary.main",
            },
          }}
          onClick={toggleTheme}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: darkMode ? "rgba(56, 182, 255, 0.15)" : "rgba(0, 86, 210, 0.1)",
                    color: darkMode ? "#38B6FF" : "#0056D2",
                    width: 46,
                    height: 46,
                  }}
                >
                  {darkMode ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    Modo Oscuro
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {darkMode
                      ? "La interfaz utiliza colores oscuros para descansar la vista."
                      : "La interfaz utiliza la paleta clara oficial de DigitalArs."}
                  </Typography>
                </Box>
              </Box>

              <Switch
                checked={darkMode}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleTheme();
                  }
                }}
                color="primary"
                slotProps={{
                  input: {
                    "aria-label": "Alternar modo oscuro",
                    onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleTheme();
                      }
                    },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* 2. Accesos Rápidos a Secciones Existentes (Solo para Usuarios Estándar, oculto para Admin) */}
        {!isAdmin && (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                Gestión de tu Cuenta
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5, fontSize: "0.86rem" }}>
                Accede directamente a los módulos de configuración y consulta de tu cuenta:
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                {shortcutLinks.map((item, idx) => (
                  <Paper
                    key={idx}
                    component="button"
                    type="button"
                    onClick={() => navigate(item.path)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(item.path);
                      }
                    }}
                    variant="outlined"
                    sx={{
                      width: "100%",
                      fontFamily: "inherit",
                      textAlign: "left",
                      color: "text.primary",
                      bgcolor: "background.paper",
                      p: 2,
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                        transform: "translateX(4px)",
                      },
                      "&:focus-visible": {
                        outline: "2px solid #38BDF8 !important",
                        outlineOffset: "2px",
                        borderRadius: "14px",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "10px",
                          bgcolor: "action.selected",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                          {item.subtitle}
                        </Typography>
                      </Box>
                    </Box>

                    <ArrowForwardIosIcon sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* 3. Información del Sistema */}
        <Box sx={{ textAlign: "center", pt: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            DigitalArs Web App · Versión 2.0.0
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Sesión iniciada como <strong>{user?.email}</strong>
          </Typography>
        </Box>
      </Box>
    </AppLayout>
  );
}

export default SettingsPage;
