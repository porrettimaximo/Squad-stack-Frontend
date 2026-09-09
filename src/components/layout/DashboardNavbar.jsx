import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Badge,
  Avatar,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import NotificationPopover from "../common/NotificationPopover";
import notificationService from "../../services/notificationService";

/**
 * DashboardNavbar: Barra superior fija (Desktop)
 * Efectos integrados (motion.dev):
 * - Microinteracción en campana: whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }} simulando timbre/campanada.
 * - Microinteracción en perfil: whileHover con escalado suave scale 1.02.
 */
export function DashboardNavbar({ currentTab = 0, onTabChange, userName = "Usuario", showTabs = true }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [notificationsAnchor, setNotificationsAnchor] = React.useState(null);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchUnread = React.useCallback(async () => {
    try {
      const count = await notificationService.getUnreadNotificationCount();
      setUnreadCount(count || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  React.useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const handleOpenNotifications = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchor(null);
    fetchUnread();
  };

  const isNotificationsOpen = Boolean(notificationsAnchor);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 70,
          }}
        >
          {/* Lado Izquierdo vacío para alinear Notificaciones + Perfil a la derecha */}
          <Box />

          {/* Lado Derecho: Notificaciones + Perfil */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2.5 } }}>
            {/* Campana de Notificación con microinteracción Motion */}
            <motion.div
              whileHover={{ rotate: [0, -12, 12, -6, 6, 0] }}
              transition={{ duration: 0.4 }}
            >
              <IconButton
                onClick={handleOpenNotifications}
                aria-label="Ver notificaciones"
                sx={{
                  bgcolor: isNotificationsOpen ? "action.selected" : "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                  width: 42,
                  height: 42,
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "action.selected" },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  max={9}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#EF4444",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      height: 18,
                      minWidth: 18,
                      top: 2,
                      right: 2,
                    },
                  }}
                >
                  <NotificationsNoneOutlinedIcon sx={{ color: isNotificationsOpen ? "primary.main" : "text.primary", fontSize: "1.3rem" }} />
                </Badge>
              </IconButton>
            </motion.div>

            {/* Popover Desplegable de Notificaciones */}
            <NotificationPopover
              anchorEl={notificationsAnchor}
              open={isNotificationsOpen}
              onClose={handleCloseNotifications}
              onNotificationsChange={fetchUnread}
            />

            {/* Separador vertical */}
            <Box
              sx={{
                width: "1px",
                height: 30,
                bgcolor: "divider",
                display: { xs: "none", sm: "block" },
              }}
            />

            {/* Perfil del Usuario con animación Motion y accesibilidad por teclado */}
            <Box
              component={motion.button}
              type="button"
              onClick={() => navigate("/profile")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/profile");
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Ver mi perfil (${userName})`}
              sx={{
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                cursor: "pointer",
                p: 0.6,
                borderRadius: "12px",
                fontFamily: "inherit",
                textAlign: "left",
                color: "inherit",
                transition: "background-color 0.15s ease",
                "&:hover": { bgcolor: "action.hover" },
                "&:focus-visible": {
                  outline: "2px solid #38BDF8 !important",
                  outlineOffset: "2px",
                  borderRadius: "12px",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: isAdmin ? "rgba(124, 58, 237, 0.15)" : "rgba(0, 86, 210, 0.15)",
                  color: isAdmin ? "#A78BFA" : "primary.main",
                  width: 38,
                  height: 38,
                }}
              >
                <PersonOutlineOutlinedIcon fontSize="small" />
              </Avatar>

              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}
                >
                  {userName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.75rem" }}
                >
                  {isAdmin ? "Administrador" : "Mi Perfil"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default DashboardNavbar;
