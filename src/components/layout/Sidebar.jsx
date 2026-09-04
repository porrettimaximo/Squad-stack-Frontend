import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * Sidebar: Barra lateral izquierda fija (Desktop)
 * Efectos integrados (motion.dev):
 * - Microdesplazamiento en X al hover: whileHover={{ x: 4 }} para dar dinamismo a la navegación.
 * - Feedback táctil / tap: whileTap={{ scale: 0.98 }}.
 */
export function Sidebar({ activeItem = "inicio", onItemClick, onLogout }) {
  const navigate = useNavigate();

  const mainNav = [
    { id: "inicio", label: "Inicio", icon: <HomeOutlinedIcon />, path: "/" },
    {
      id: "admin-users",
      label: "Usuarios",
      icon: <AdminPanelSettingsOutlinedIcon />,
      path: "/admin/users",
    },
    { id: "historial", label: "Historial", icon: <HistoryOutlinedIcon /> },
    { id: "tarjetas", label: "Tarjetas", icon: <CreditCardOutlinedIcon /> },
    { id: "perfil", label: "Perfil", icon: <PersonOutlineOutlinedIcon /> },
    {
      id: "configuracion",
      label: "Configuración",
      icon: <SettingsOutlinedIcon />,
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
      sx={{
        width: 240,
        height: "100vh",
        bgcolor: "#02122c",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Cabecera: Logo + DigitalArs */}
      <Box
        onClick={() => navigate("/")}
        sx={{
          p: 3,
          pb: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            bgcolor: "#0e2448",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
          }}
        >
          <AccountBalanceWalletOutlinedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, fontSize: "1.15rem", lineHeight: 1.1 }}
          >
            DigitalArs
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#7F96B2", fontSize: "0.75rem", fontWeight: 500 }}
          >
            Billetera Digital
          </Typography>
        </Box>
      </Box>

      {/* Menú Principal */}
      <List sx={{ px: 1.5, py: 1, flex: 1 }}>
        {mainNav.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.6 }}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                style={{ width: "100%" }}
                transition={{ duration: 0.15 }}
              >
                <ListItemButton
                  onClick={() => handleClick(item)}
                  sx={{
                    borderRadius: "8px",
                    py: 1.1,
                    px: 2,
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
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "#FFFFFF" : "#8EA3BF",
                      minWidth: 38,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.925rem",
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </motion.div>
            </ListItem>
          );
        })}
      </List>

      {/* Sección Inferior: Soporte, Ayuda y Cerrar Sesión */}
      <Box sx={{ px: 2, pb: 3, pt: 1 }}>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", mb: 2 }} />

        <List disablePadding sx={{ mb: 2 }}>
          {bottomNav.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <motion.div whileHover={{ x: 3 }} style={{ width: "100%" }}>
                <ListItemButton
                  onClick={() => onItemClick && onItemClick(item.id)}
                  sx={{
                    py: 0.75,
                    px: 1.5,
                    borderRadius: "6px",
                    color: "#7F96B2",
                    "&:hover": {
                      color: "#FFFFFF",
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.85rem",
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </motion.div>
            </ListItem>
          ))}
        </List>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutOutlinedIcon fontSize="small" />}
            onClick={onLogout}
            sx={{
              color: "#D0D9E5",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
              py: 1,
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
            Cerrar Sesión
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
}

export default Sidebar;
