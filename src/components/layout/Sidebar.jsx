import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  IconButton,
} from "@mui/material";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import iconoImg from "../../assets/iconoPrincipal.png";
import iconoSmall from "../../assets/icono.png";

/**
 * Sidebar: Barra lateral izquierda fija (Desktop)
 */
export function Sidebar({ activeItem = "inicio", onItemClick, onLogout }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = (val) => {
    setCollapsed(val);
    try {
      localStorage.setItem("sidebar_collapsed", String(val));
    } catch (e) {
      console.error("Error saving sidebar state:", e);
    }
  };

  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const mainNav = [
    { id: "inicio", label: "Inicio", icon: <HomeOutlinedIcon />, path: "/" },
    {
      id: "historial",
      label: "Historial",
      icon: <HistoryOutlinedIcon />,
      path: "/history",
    },
    {
      id: "inversiones",
      label: "Inversiones",
      icon: <TrendingUpOutlinedIcon />,
      path: "/investments",
    },
    { id: "tarjetas", label: "Tarjetas", icon: <CreditCardOutlinedIcon />, path: "/cards" },
    { id: "perfil", label: "Perfil", icon: <PersonOutlineOutlinedIcon />, path: "/profile" },
    ...(isAdmin
      ? [{ id: "admin", label: "Usuarios Admin", icon: <AdminPanelSettingsOutlinedIcon />, path: "/admin" }]
      : []),
    {
      id: "configuracion",
      label: "Configuración",
      icon: <SettingsOutlinedIcon />,
      path: "/",
    },
  ];

  const bottomNav = [
    {
      id: "soporte",
      label: "Soporte",
      icon: <HeadsetMicOutlinedIcon fontSize="small" />,
      path: "/support",
    },
    {
      id: "ayuda",
      label: "Ayuda",
      icon: <HelpOutlineOutlinedIcon fontSize="small" />,
      path: "/help",
    },
  ];

  const handleClick = (item) => {
    if (onItemClick) {
      onItemClick(item.id);
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: collapsed ? 80 : 240,
        height: "100vh",
        bgcolor: "#02122c",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}
    >
      {/* Cabecera: Logo Principal PNG y Botón de Colapsar */}
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          pt: 2,
          pb: 1,
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          alignItems: "center",
          minHeight: 60,
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <>
            <Box
              component="img"
              src={iconoImg}
              alt="DigitalArs"
              onClick={() => navigate("/")}
              sx={{
                width: "100%",
                maxWidth: 130,
                height: "auto",
                maxHeight: 52,
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleToggleCollapse(true)}
              aria-label="Colapsar menú"
              sx={{
                color: "#8EA3BF",
                "&:hover": {
                  color: "#FFF",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              <MenuOpenIcon />
            </IconButton>
          </>
        )}

        {collapsed && (
          <Box
            sx={{
              position: "relative",
              width: 36,
              height: 36,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={iconoSmall}
              alt="DigitalArs"
              onClick={() => navigate("/")}
              sx={{
                position: "absolute",
                width: 28,
                height: 28,
                objectFit: "contain",
                opacity: isHovered ? 0 : 1,
                transform: isHovered
                  ? "scale(0.8) rotate(-10deg)"
                  : "scale(1) rotate(0deg)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: isHovered ? "none" : "auto",
                cursor: "pointer",
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleToggleCollapse(false)}
              aria-label="Expandir menú"
              sx={{
                position: "absolute",
                color: "#8EA3BF",
                opacity: isHovered ? 1 : 0,
                transform: isHovered
                  ? "scale(1) rotate(0deg)"
                  : "scale(0.8) rotate(10deg)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: isHovered ? "auto" : "none",
                "&:hover": {
                  color: "#FFF",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              <MenuOpenIcon sx={{ transform: "rotate(180deg)" }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Menú Principal (Scrollable si es necesario) */}
      <List
        sx={{
          px: collapsed ? 1 : 1.5,
          py: 0.5,
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255, 255, 255, 0.1)", borderRadius: "4px" },
        }}
      >
        {mainNav.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.35 }}>
              <motion.div
                whileHover={collapsed ? {} : { x: 4 }}
                whileTap={{ scale: 0.98 }}
                style={{ width: "100%" }}
                transition={{ duration: 0.15 }}
              >
                <ListItemButton
                  onClick={() => handleClick(item)}
                  sx={{
                    borderRadius: "8px",
                    py: 0.8,
                    px: collapsed ? 0 : 1.75,
                    justifyContent: collapsed ? "center" : "flex-start",
                    bgcolor: isActive ? "#0056D2" : "transparent",
                    color: isActive ? "#FFFFFF" : "#8EA3BF",
                    fontWeight: isActive ? 700 : 500,
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: isActive
                        ? "#0047B3"
                        : "rgba(255, 255, 255, 0.05)",
                      color: "#FFFFFF",
                    },
                  }}
                  title={collapsed ? item.label : ""}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "#FFFFFF" : "#8EA3BF",
                      minWidth: collapsed ? 0 : 34,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.88rem",
                        fontWeight: isActive ? 700 : 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </motion.div>
            </ListItem>
          );
        })}
      </List>

      {/* Sección Inferior: Soporte, Ayuda y Cerrar Sesión (Siempre visible) */}
      <Box sx={{ px: collapsed ? 1 : 1.75, pb: 2, pt: 0.5, flexShrink: 0 }}>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", mb: 1 }} />

        <List disablePadding sx={{ mb: 1.5 }}>
          {bottomNav.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.35 }}>
                <motion.div
                  whileHover={collapsed ? {} : { x: 3 }}
                  style={{ width: "100%" }}
                >
                  <ListItemButton
                    onClick={() => handleClick(item)}
                    selected={isActive}
                    sx={{
                      py: 0.6,
                      px: collapsed ? 0 : 1.25,
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: "6px",
                      color: isActive ? "#38B6FF" : "#7F96B2",
                      bgcolor: isActive ? "rgba(0, 119, 255, 0.15) !important" : "transparent",
                      "&:hover": {
                        color: "#FFFFFF",
                        bgcolor: isActive ? "rgba(0, 119, 255, 0.25) !important" : "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                    title={collapsed ? item.label : ""}
                  >
                    <ListItemIcon
                      sx={{
                        color: "inherit",
                        minWidth: collapsed ? 0 : 28,
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: "0.82rem",
                          fontWeight: 500,
                        }}
                      />
                    )}
                  </ListItemButton>
                </motion.div>
              </ListItem>
            );
          })}
        </List>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleLogoutAction}
            title={collapsed ? "Cerrar sesión" : ""}
            sx={{
              color: "#D0D9E5",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
              py: 0.75,
              minWidth: collapsed ? "auto" : "auto",
              px: collapsed ? 0 : 1.5,
              justifyContent: collapsed ? "center" : "flex-start",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.4)",
                bgcolor: "rgba(255, 255, 255, 0.05)",
                color: "#FFFFFF",
              },
            }}
          >
            <LogoutOutlinedIcon sx={{ mr: collapsed ? 0 : 1, fontSize: "1.1rem" }} />
            {!collapsed && "Cerrar sesión"}
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
}

export default Sidebar;
