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
  Typography,
} from "@mui/material";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import iconoImg from "../../assets/iconoPrincipal.png";
import iconoSmall from "../../assets/icono.png";

/**
 * Sidebar: Barra lateral izquierda fija (Desktop) o menú deslizable (Mobile).
 */
export function Sidebar({ activeItem = "inicio", onItemClick, onLogout, onClose, isMobileDrawer = false }) {
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
    if (onClose) onClose();
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate("/login");
    }
  };

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const mainNav = isAdmin
    ? [
        {
          id: "admin",
          label: "Gestión de Usuarios",
          icon: <AdminPanelSettingsOutlinedIcon />,
          path: "/admin",
        },
        {
          id: "perfil",
          label: "Perfil",
          icon: <PersonOutlineOutlinedIcon />,
          path: "/profile",
        },
        {
          id: "configuracion",
          label: "Configuración",
          icon: <SettingsOutlinedIcon />,
          path: "/settings",
        },
      ]
    : [
        { id: "inicio", label: "Inicio", icon: <HomeOutlinedIcon />, path: "/" },
        { id: "servicios", label: "Servicios", icon: <ReceiptLongOutlinedIcon />, path: "/services" },
        { id: "reservas", label: "Reservas", icon: <SavingsOutlinedIcon />, path: "/reserves" },
        { id: "historial", label: "Historial", icon: <HistoryOutlinedIcon />, path: "/history" },
        { id: "inversiones", label: "Inversiones", icon: <TrendingUpOutlinedIcon />, path: "/investments" },
        { id: "tarjetas", label: "Tarjetas", icon: <CreditCardOutlinedIcon />, path: "/cards" },
        { id: "perfil", label: "Perfil", icon: <PersonOutlineOutlinedIcon />, path: "/profile" },
        {
          id: "configuracion",
          label: "Configuración",
          icon: <SettingsOutlinedIcon />,
          path: "/settings",
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
    if (onClose) {
      onClose();
    }
    if (onItemClick) {
      onItemClick(item.id);
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: isMobileDrawer ? 280 : (collapsed ? 80 : 240),
        height: "100%",
        minHeight: "100%",
        maxHeight: isMobileDrawer ? "100dvh" : "100vh",
        bgcolor: "#02122c",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Cabecera: Logo Principal PNG y Botón de Colapsar / Cerrar */}
      <Box
        sx={{
          px: collapsed && !isMobileDrawer ? 1 : 2.5,
          pt: 1.8,
          pb: 1,
          display: "flex",
          justifyContent: collapsed && !isMobileDrawer ? "center" : "space-between",
          alignItems: "center",
          minHeight: 52,
          flexShrink: 0,
        }}
      >
        {isMobileDrawer ? (
          <>
            <Box
              component="img"
              src={iconoImg}
              alt="DigitalArs"
              onClick={() => {
                if (onClose) onClose();
                navigate(isAdmin ? "/admin" : "/");
              }}
              sx={{
                width: "auto",
                maxWidth: 165,
                height: "auto",
                maxHeight: 65,
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
            <IconButton
              onClick={onClose}
              aria-label="Cerrar menú lateral"
              sx={{
                color: "#8EA3BF",
                "&:hover": {
                  color: "#FFF",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </>
        ) : !collapsed ? (
          <>
            <Box
              component="img"
              src={iconoImg}
              alt="DigitalArs"
              onClick={() => navigate(isAdmin ? "/admin" : "/")}
              sx={{
                width: "auto",
                maxWidth: 180,
                height: "auto",
                maxHeight: 80,
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
            <IconButton
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
        ) : null}

        {collapsed && (
          <Box
            sx={{
              position: "relative",
              width: 46,
              height: 46,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={iconoSmall}
              alt="DigitalArs"
              onClick={() => navigate(isAdmin ? "/admin" : "/")}
              sx={{
                position: "absolute",
                width: 38,
                height: 38,
                objectFit: "contain",
                opacity: isHovered ? 0 : 1,
                transform: isHovered
                  ? "scale(0.85) rotate(-10deg)"
                  : "scale(1) rotate(0deg)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: isHovered ? "none" : "auto",
                cursor: "pointer",
              }}
            />
            <IconButton
              onClick={() => handleToggleCollapse(false)}
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

      {/* Línea divisoria superior arriba de Inicio, idéntica a la que hay arriba de Soporte */}
      <Box sx={{ px: collapsed ? 1 : 1.8, pt: 0.5, pb: 0.5, flexShrink: 0 }}>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />
      </Box>

      {/* Menú Principal */}
      <List
        sx={{
          px: collapsed ? 0.8 : 1.5,
          pb: isMobileDrawer ? 5 : 2,
          pt: 1,
          minHeight: 0,
          overflowY: isMobileDrawer ? "visible" : "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255, 255, 255, 0.15)", borderRadius: 2 },
        }}
      >
        {mainNav.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                component={motion.div}
                whileHover={collapsed ? {} : { x: 3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleClick(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick(item);
                  }
                }}
                tabIndex={0}
                sx={{
                  width: "100%",
                  borderRadius: "8px",
                  py: 0.65,
                  px: collapsed ? 0 : 1.6,
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
                  "&:focus-visible": {
                    outline: "2px solid #38B6FF !important",
                    outlineOffset: "2px",
                  },
                }}
                title={collapsed ? item.label : ""}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#FFFFFF" : "#8EA3BF",
                    minWidth: collapsed ? 0 : 34,
                    justifyContent: "center",
                    "& .MuiSvgIcon-root": { fontSize: "1.28rem" },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <Typography
                    sx={{
                      fontSize: "0.865rem",
                      fontWeight: isActive ? 700 : 500,
                      lineHeight: 1.2,
                      color: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </Typography>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Sección Inferior: Soporte, Ayuda y Cerrar Sesión */}
      <Box
        sx={{
          px: collapsed ? 0.8 : 1.5,
          py: 0.4,
          flex: isMobileDrawer ? "none" : 1,
          flexShrink: 0,
          mt: isMobileDrawer ? 2 : "auto",
        }}
      >
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", mb: 1 }} />

        <List disablePadding sx={{ mb: 1 }}>
          {bottomNav.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.3 }}>
                <ListItemButton
                  component={motion.div}
                  whileHover={collapsed ? {} : { x: 3 }}
                  onClick={() => handleClick(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClick(item);
                    }
                  }}
                  selected={isActive}
                  tabIndex={0}
                  sx={{
                    width: "100%",
                    py: 0.55,
                    px: collapsed ? 0 : 1.6,
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "7px",
                    color: isActive ? "#38B6FF" : "#7F96B2",
                    bgcolor: isActive ? "rgba(0, 119, 255, 0.15) !important" : "transparent",
                    "&:hover": {
                      color: "#FFFFFF",
                      bgcolor: isActive ? "rgba(0, 119, 255, 0.25) !important" : "rgba(255, 255, 255, 0.05)",
                    },
                    "&:focus-visible": {
                      outline: "2px solid #38B6FF !important",
                      outlineOffset: "2px",
                    },
                  }}
                  title={collapsed ? item.label : ""}
                >
                  <ListItemIcon
                    sx={{
                      color: "inherit",
                      minWidth: collapsed ? 0 : 32,
                      justifyContent: "center",
                      "& .MuiSvgIcon-root": { fontSize: "1.2rem" },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <Typography
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        lineHeight: 1.2,
                        color: "inherit",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Button
          component={motion.button}
          whileTap={{ scale: 0.95 }}
          fullWidth
          variant="outlined"
          onClick={handleLogoutAction}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleLogoutAction();
            }
          }}
          title={collapsed ? "Cerrar sesión" : ""}
          sx={{
            color: "#D0D9E5",
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            py: 0.65,
            minWidth: collapsed ? "auto" : "auto",
            px: collapsed ? 0 : 1.6,
            justifyContent: collapsed ? "center" : "flex-start",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.82rem",
            "&:hover": {
              borderColor: "rgba(255, 255, 255, 0.4)",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              color: "#FFFFFF",
            },
            "&:focus-visible": {
              outline: "2px solid #38B6FF !important",
              outlineOffset: "2px",
            },
          }}
        >
          <LogoutOutlinedIcon sx={{ mr: collapsed ? 0 : 1, fontSize: "1.2rem" }} />
          {!collapsed && "Cerrar sesión"}
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;
