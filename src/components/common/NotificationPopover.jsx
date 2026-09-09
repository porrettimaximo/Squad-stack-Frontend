import React, { useState, useEffect, useCallback } from "react";
import {
  Popover,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import notificationService from "../../services/notificationService";


const getNotificationIcon = (type) => {
  switch (type) {
    case "TransferIn":
      return <ArrowDownwardIcon sx={{ color: "#10B981", fontSize: "1.25rem" }} />;
    case "Deposit":
      return <SavingsOutlinedIcon sx={{ color: "#0056D2", fontSize: "1.25rem" }} />;
    case "Welcome":
      return <CelebrationOutlinedIcon sx={{ color: "#F59E0B", fontSize: "1.25rem" }} />;
    default:
      return <InfoOutlinedIcon sx={{ color: "text.secondary", fontSize: "1.25rem" }} />;
  }
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return "Hace un momento";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
};

/**
 * NotificationPopover: Menú desplegable animado para la campana de notificaciones.
 * Conectado con la API de notificaciones en tiempo real, permite marcar como leídas,
 * navegar a la sección correspondiente o ver el estado vacío cuando no hay avisos.
 */
export function NotificationPopover({ anchorEl, open, onClose, onNotificationsChange }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications(20);
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleMarkAsRead = async (item) => {
    if (!item.IsRead && !item.isRead) {
      try {
        await notificationService.markNotificationAsRead(item.id || item.Id);
        setNotifications((prev) =>
          prev.map((n) =>
            (n.id === item.id || n.Id === item.Id) ? { ...n, isRead: true, IsRead: true } : n
          )
        );
        if (onNotificationsChange) onNotificationsChange();
      } catch {}
    }

    const targetUrl = item.actionUrl || item.ActionUrl;
    if (targetUrl) {
      onClose();
      navigate(targetUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await notificationService.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, IsRead: true }))
      );
      if (onNotificationsChange) onNotificationsChange();
    } catch {} finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setDeletingId(id);
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => (n.id !== id && n.Id !== id)));
      if (onNotificationsChange) onNotificationsChange();
    } catch {
      setNotifications((prev) => prev.filter((n) => (n.id !== id && n.Id !== id)));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      setDeletingAll(true);
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      if (onNotificationsChange) onNotificationsChange();
    } catch {
      setNotifications([]);
    } finally {
      setDeletingAll(false);
    }
  };


  const unreadCount = notifications.filter((n) => !n.isRead && !n.IsRead).length;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            mt: 1.5,
            width: { xs: "calc(100vw - 32px)", sm: 380 },
            maxWidth: 400,
            borderRadius: "18px",
            bgcolor: "background.paper",
            boxShadow: "0 20px 45px -10px rgba(0, 22, 57, 0.18), 0 0 1px 1px rgba(0, 22, 57, 0.08)",
            border: "1px solid", borderColor: "divider",
            overflow: "hidden",
          },
        },
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            {/* Cabecera del Panel */}
            <Box
              sx={{
                px: 2.5,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "action.hover",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "10px",
                    bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.2)" : "rgba(0, 86, 210, 0.1)",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <NotificationsNoneOutlinedIcon sx={{ fontSize: "1.2rem" }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.98rem", lineHeight: 1.2 }}>
                    Notificaciones
                  </Typography>
                  {unreadCount > 0 && (
                    <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.76rem" }}>
                      {unreadCount} sin leer
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "none",
                      color: "primary.main",
                      py: 0.4,
                      px: 1,
                    }}
                  >
                    {markingAll ? <CircularProgress size={14} /> : "Leídas"}
                  </Button>
                )}
                <IconButton
                  size="small"
                  onClick={onClose}
                  aria-label="Cerrar notificaciones"
                  sx={{
                    color: "text.secondary",
                    "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                  }}
                >
                  <CloseIcon sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </Box>
            </Box>

            {/* Contenido: Cargando, Lista o Estado Vacío */}
            {loading ? (
              <Box sx={{ py: 6, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress size={28} sx={{ color: "primary.main" }} />
              </Box>
            ) : notifications.length > 0 ? (
              <List sx={{ p: 0, maxHeight: 380, overflowY: "auto" }}>
                {notifications.map((item) => {
                  const isRead = item.isRead ?? item.IsRead;
                  const type = item.type || item.Type;
                  const title = item.title || item.Title;
                  const message = item.message || item.Message;
                  const createdAt = item.createdAt || item.CreatedAt;

                  return (
                    <ListItem key={item.id || item.Id} disablePadding divider sx={{ borderColor: "divider" }}>
                      <ListItemButton
                        onClick={() => handleMarkAsRead(item)}
                        sx={{
                          py: 1.6,
                          px: 2.2,
                          bgcolor: isRead
                            ? "transparent"
                            : (theme) => (theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.12)" : "rgba(0, 86, 210, 0.04)"),
                          transition: "background-color 0.15s ease",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 42 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              bgcolor: isRead ? "action.hover" : (theme) => theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.2)" : "rgba(0, 86, 210, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {getNotificationIcon(type)}
                          </Box>
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.3 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: isRead ? 600 : 800,
                                  color: isRead ? "text.secondary" : "text.primary",
                                  fontSize: "0.88rem",
                                }}
                              >
                                {title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.72rem", flexShrink: 0 }}>
                                {formatRelativeTime(createdAt)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.82rem",
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {message}
                            </Typography>
                          }
                        />

                        {!isRead && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#0056D2",
                              flexShrink: 0,
                              ml: 1,
                            }}
                          />
                        )}

                        <Tooltip title="Eliminar notificación">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDeleteNotification(item.id || item.Id, e)}
                            disabled={deletingId === (item.id || item.Id)}
                            sx={{
                              color: "#94A3B8",
                              ml: 0.8,
                              p: 0.6,
                              "&:hover": { color: "#EF4444", bgcolor: "rgba(239, 68, 68, 0.08)" },
                            }}
                          >
                            {deletingId === (item.id || item.Id) ? (
                              <CircularProgress size={14} sx={{ color: "#EF4444" }} />
                            ) : (
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: "1.1rem" }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              /* Estado Vacío Animado */
              <Box
                sx={{
                  px: 3,
                  py: 5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: [0.8, 1.05, 1], rotate: [-10, 5, 0] }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Box
                    sx={{
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      bgcolor: "action.hover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2.5,
                      position: "relative",
                      boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)",
                    }}
                  >
                    <NotificationsNoneOutlinedIcon
                      sx={{ fontSize: "2.3rem", color: "#94A3B8" }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "#10B981",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #FFFFFF",
                      }}
                    >
                      <CheckCircleOutlinedIcon sx={{ fontSize: "0.95rem" }} />
                    </Box>
                  </Box>
                </motion.div>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    fontSize: "1.05rem",
                    mb: 0.8,
                  }}
                >
                  No tienes notificaciones
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    maxWidth: 260,
                  }}
                >
                  Estás al día. Te avisaremos aquí ante transferencias recibidas, depósitos acreditados y movimientos clave en tu cuenta.
                </Typography>
              </Box>
            )}

            {/* Pie del Panel */}
            <Divider sx={{ borderColor: "divider" }} />
            <Box
              sx={{
                p: 1.2,
                px: 2,
                bgcolor: "action.hover",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {notifications.length > 0 ? (
                <Button
                  size="small"
                  startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: "1rem" }} />}
                  onClick={handleDeleteAllNotifications}
                  disabled={deletingAll}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "#EF4444",
                    borderRadius: "8px",
                    "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" },
                  }}
                >
                  {deletingAll ? <CircularProgress size={14} sx={{ color: "#EF4444" }} /> : "Eliminar todas"}
                </Button>
              ) : <Box />}

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    startIcon={<DoneAllIcon sx={{ fontSize: "0.95rem" }} />}
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      color: "primary.main",
                      borderRadius: "8px",
                      "&:hover": { bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.15)" : "rgba(0, 86, 210, 0.08)" },
                    }}
                  >
                    {markingAll ? <CircularProgress size={14} sx={{ color: "primary.main" }} /> : "Leídas"}
                  </Button>
                )}

                <Button
                  size="small"
                  onClick={onClose}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: "text.secondary",
                    borderRadius: "8px",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  Cerrar
                </Button>
              </Box>
            </Box>

          </motion.div>
        )}
      </AnimatePresence>
    </Popover>
  );
}

export default NotificationPopover;
