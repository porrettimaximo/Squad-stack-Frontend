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
import iconoImg from "../../assets/iconoPrincipal.png";
import iconoSmall from "../../assets/icono.png";

/**
 * Sidebar: Barra lateral izquierda fija (Desktop)
 */
export function Sidebar({ activeItem = "inicio", onItemClick, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const mainNav = [
    { id: "inicio", label: "Inicio", icon: <HomeOutlinedIcon />, path: "/" },
    {
      id: "admin-users",
      label: "Usuarios",
      icon: <AdminPanelSettingsOutlinedIcon />,
      path: "/admin/users",
    },
    { id: "historial", label: "Historial", icon: <HistoryOutlinedIcon />, path: "/" },
    { id: "tarjetas", label: "Tarjetas", icon: <CreditCardOutlinedIcon />, path: "/" },
    { id: "perfil", label: "Perfil", icon: <PersonOutlineOutlinedIcon />, path: "/" },
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
    },
    {
      id: "ayuda",
      label: "Ayuda",
      icon: <HelpOutlineOutlinedIcon fontSize="small" />,
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
          px: collapsed ? 1 : 2.5,
          pt: 3.5,
          pb: 2,
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          alignItems: "center",
          minHeight: 80,
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
                maxWidth: 140,
                height: "auto",
                maxHeight: 80,
                objectFit: "contain",
                cursor: "pointer",
              }}
            />
            <IconButton
              onClick={() => setCollapsed(true)}
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
                      primaryTypographyProps={{
                        fontSize: "0.925rem",
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

      {/* Sección Inferior: Soporte, Ayuda y Cerrar Sesión */}
      <Box sx={{ px: collapsed ? 1 : 2, pb: 3, pt: 1 }}>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", mb: 2 }} />

        <List disablePadding sx={{ mb: 2 }}>
          {bottomNav.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <motion.div
                whileHover={collapsed ? {} : { x: 3 }}
                style={{ width: "100%" }}
              >
                <ListItemButton
                  onClick={() => onItemClick && onItemClick(item.id)}
                  sx={{
                    py: 0.75,
                    px: collapsed ? 0 : 1.5,
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "6px",
                    color: "#7F96B2",
                    "&:hover": {
                      color: "#FFFFFF",
                      bgcolor: "rgba(255, 255, 255, 0.05)",
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
                      primaryTypographyProps={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </motion.div>
            </ListItem>
          ))}
        </List>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onLogout}
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
            }}
          >
            <LogoutOutlinedIcon sx={{ mr: collapsed ? 0 : 1 }} />
            {!collapsed && "Cerrar sesión"}
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
}

export default Sidebar;
