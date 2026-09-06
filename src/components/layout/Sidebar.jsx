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
import iconoImg from "../../assets/iconoPrincipal.png";
import iconoSmall from "../../assets/icono.png";

/**
 * Sidebar: Barra lateral izquierda fija (Desktop) o menú deslizable (Mobile).
 */
export function Sidebar({ activeItem = "inicio", onItemClick, onLogout, onClose, isMobileDrawer = false }) {
  const [collapsed, setCollapsed] = useState(false);
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

  const mainNav = [
    { id: "inicio", label: "Inicio", icon: <HomeOutlinedIcon />, path: "/" },
    { id: "historial", label: "Historial", icon: <HistoryOutlinedIcon />, path: "/history" },
    { id: "inversiones", label: "Inversiones", icon: <TrendingUpOutlinedIcon />, path: "/investments" },
    { id: "tarjetas", label: "Tarjetas", icon: <CreditCardOutlinedIcon />, path: "/" },
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
      {/* Cabecera: Logo Principal PNG y Botón de Colapsar / Cerrar */}
      <Box
        sx={{
          px: collapsed && !isMobileDrawer ? 1 : 2.5,
          pt: 3,
          pb: 2,
          display: "flex",
          justifyContent: collapsed && !isMobileDrawer ? "center" : "space-between",
          alignItems: "center",
          minHeight: 70,
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
                navigate("/");
              }}
              sx={{
                width: "100%",
                maxWidth: 130,
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
              onClick={() => navigate("/")}
              sx={{
                width: "100%",
                maxWidth: 140,
                height: "auto",
                maxHeight: 80,
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
            <IconButton
              onClick={() => setCollapsed(true)}
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
              width: 40,
              height: 40,
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
                width: 32,
                height: 32,
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
              onClick={() => setCollapsed(false)}
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

      {/* Menú Principal */}
      <List sx={{ px: collapsed ? 1 : 1.5, py: 1, flex: 1 }}>
        {mainNav.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.6 }}>
              <ListItemButton
                component={motion.div}
                whileHover={collapsed ? {} : { x: 4 }}
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
                  py: 1.1,
                  px: collapsed ? 0 : 2,
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
                    minWidth: collapsed ? 0 : 38,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        fontSize: "0.925rem",
                        fontWeight: isActive ? 700 : 500,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Sección Inferior: Soporte, Ayuda y Cerrar Sesión */}
      <Box sx={{ px: collapsed ? 1 : 2, pb: 3, pt: 1 }}>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", mb: 2 }} />

        <List disablePadding sx={{ mb: 2 }}>
          {bottomNav.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
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
                    py: 0.75,
                    px: collapsed ? 0 : 1.5,
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "6px",
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
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          fontSize: "0.85rem",
                          fontWeight: 500,
                        },
                      }}
                    />
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
            borderRadius: "10px",
            py: 1,
            minWidth: collapsed ? "auto" : "auto",
            px: collapsed ? 0 : 2,
            justifyContent: collapsed ? "center" : "flex-start",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
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
          <LogoutOutlinedIcon sx={{ mr: collapsed ? 0 : 1 }} />
          {!collapsed && "Cerrar sesión"}
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;
