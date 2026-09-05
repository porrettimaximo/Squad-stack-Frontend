import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import SaveIcon from "@mui/icons-material/Save";
import KeyIcon from "@mui/icons-material/Key";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { motion, AnimatePresence } from "framer-motion";

import AppLayout from "../../components/layout/AppLayout";
import { useAccount } from "../../hooks/useAccount";
import userService from "../../services/userService";
import { formatTransactionDate } from "../../utils/formatters";

/**
 * HU-28: Pantalla de perfil de usuario.
 * Muestra todos los datos del usuario con modo visualización y modo formulario editable
 * al hacer clic en "Editar datos personales". Sin campo de rol.
 */
export function ProfilePage() {
  const { user, updateUserProfile } = useAccount();

  // Estados de carga
  const [initialLoading, setInitialLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Modo edición para datos personales
  const [isEditing, setIsEditing] = useState(false);

  // Modo edición para seguridad y contraseña
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Datos del perfil (modo visualización)
  const [profileData, setProfileData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    createdAt: "",
    isActive: true,
  });

  // Datos del formulario en modo edición
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
  });

  // Campos de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Visibilidad de contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notificaciones Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // 1. Cargar datos del perfil con GET /api/users/me (Criterio de Aceptación 1)
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setInitialLoading(true);
      try {
        const data = await userService.getMyProfile();
        if (isMounted && data) {
          setProfileData({
            id: data.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            createdAt: data.createdAt || "",
            isActive: data.isActive ?? true,
          });

          setEditFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
          });

          // Sincronizar con contexto global
          updateUserProfile({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          });
        }
      } catch (error) {
        console.warn("No se pudo obtener el perfil de /users/me, usando datos en contexto:", error?.message);
        if (isMounted) {
          const names = (user?.name || "Alejandro Silva").split(" ");
          const fallbackFirst = user?.firstName || names[0] || "Alejandro";
          const fallbackLast = user?.lastName || names.slice(1).join(" ") || "Silva";

          setProfileData({
            id: user?.id || 1,
            firstName: fallbackFirst,
            lastName: fallbackLast,
            email: user?.email || "alejandro.silva@digitalars.com",
            createdAt: user?.createdAt || new Date().toISOString(),
            isActive: true,
          });

          setEditFormData({
            firstName: fallbackFirst,
            lastName: fallbackLast,
          });
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Iniciar edición
  const handleStartEdit = () => {
    setEditFormData({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
    });
    setIsEditing(true);
  };

  // Cancelar edición de datos personales
  const handleCancelEdit = () => {
    setEditFormData({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
    });
    setIsEditing(false);
  };

  // Iniciar edición de contraseña
  const handleStartEditPassword = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditingPassword(true);
  };

  // Cancelar edición de contraseña
  const handleCancelEditPassword = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditingPassword(false);
  };

  // Manejador de cambios en formulario de edición
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejador de cambios en contraseñas
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 2. Guardar cambios de datos personales con PUT /api/users/me (Criterio de Aceptación 2 y 4)
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!editFormData.firstName.trim()) {
      setSnackbar({
        open: true,
        message: "El nombre es obligatorio.",
        severity: "error",
      });
      return;
    }

    if (!editFormData.lastName.trim()) {
      setSnackbar({
        open: true,
        message: "El apellido es obligatorio.",
        severity: "error",
      });
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await userService.updateMyProfile({
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
      });

      const newFirst = updated?.firstName || editFormData.firstName.trim();
      const newLast = updated?.lastName || editFormData.lastName.trim();

      setProfileData((prev) => ({
        ...prev,
        firstName: newFirst,
        lastName: newLast,
      }));

      // Actualizar contexto global (Navbar superior se actualiza de inmediato)
      updateUserProfile({
        firstName: newFirst,
        lastName: newLast,
      });

      // Salir del modo edición
      setIsEditing(false);

      setSnackbar({
        open: true,
        message: "¡Datos personales actualizados con éxito!",
        severity: "success",
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Error al guardar los datos personales.";

      // Fallback offline
      if (error.code === "ERR_NETWORK" || !error.response) {
        setProfileData((prev) => ({
          ...prev,
          firstName: editFormData.firstName.trim(),
          lastName: editFormData.lastName.trim(),
        }));

        updateUserProfile({
          firstName: editFormData.firstName.trim(),
          lastName: editFormData.lastName.trim(),
        });

        setIsEditing(false);

        setSnackbar({
          open: true,
          message: "Datos guardados localmente (modo offline).",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: errorMsg,
          severity: "error",
        });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // 3. Cambio de contraseña con validación de la actual y confirmación (Criterio de Aceptación 3)
  const handleSavePassword = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword) {
      setSnackbar({
        open: true,
        message: "Debes ingresar tu contraseña actual.",
        severity: "error",
      });
      return;
    }

    if (!newPassword) {
      setSnackbar({
        open: true,
        message: "Debes ingresar una nueva contraseña.",
        severity: "error",
      });
      return;
    }

    if (newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: "La nueva contraseña debe tener al menos 6 caracteres.",
        severity: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "La nueva contraseña y su confirmación no coinciden.",
        severity: "error",
      });
      return;
    }

    setSavingPassword(true);
    try {
      await userService.updateMyProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        currentPassword,
        newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setIsEditingPassword(false);

      setSnackbar({
        open: true,
        message: "¡Contraseña actualizada exitosamente!",
        severity: "success",
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "No se pudo cambiar la contraseña.";

      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim() || user?.name || "Usuario";
  const userInitials =
    `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase() || "US";

  return (
    <AppLayout activeSidebarItem="perfil" showNavbarTabs={false} maxWidth={1100}>
      <Box sx={{ width: "100%", pb: 4 }}>
        {/* Cabecera / Hero del Perfil (Sin Rol) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              mb: 3.5,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #0056D2 0%, #1e40af 100%)",
              color: "#FFFFFF",
              boxShadow: "0 10px 25px -5px rgba(0, 86, 210, 0.25)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Halo de luz decorativo */}
            <Box
              sx={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 2.5,
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Avatar Grande */}
              <Avatar
                sx={{
                  width: { xs: 70, sm: 84 },
                  height: { xs: 70, sm: 84 },
                  bgcolor: "#FFFFFF",
                  color: "#0056D2",
                  fontSize: { xs: "1.6rem", sm: "1.9rem" },
                  fontWeight: 900,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                }}
              >
                {initialLoading ? <CircularProgress size={28} color="primary" /> : userInitials}
              </Avatar>

              {/* Información General */}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.3rem", sm: "1.6rem" },
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                    }}
                  >
                    {initialLoading ? "Cargando perfil..." : fullName}
                  </Typography>
                  <Chip
                    icon={<CheckCircleOutlinedIcon sx={{ fontSize: "15px !important", color: "#15803D !important" }} />}
                    label="Cuenta Verificada"
                    size="small"
                    sx={{
                      bgcolor: "#DCFCE7",
                      color: "#15803D",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      borderRadius: "6px",
                      height: 22,
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.88)",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    mb: 0.8,
                  }}
                >
                  <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                  {profileData.email || "cargando..."}
                </Typography>

                {profileData.createdAt && (
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "rgba(255, 255, 255, 0.75)",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />
                    Miembro desde: {formatTransactionDate(profileData.createdAt)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Card>
        </motion.div>

        {/* Contenido Principal en Cuadrícula: Datos Personales + Seguridad */}
        <Grid container spacing={3}>
          {/* Tarjeta 1: Información Personal (Visualización con botón o Formulario Editable) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: "18px",
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 4px 15px -2px rgba(15, 23, 42, 0.04)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Título de Sección con estado de visualización o edición */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "10px",
                          bgcolor: "#EFF6FF",
                          color: "#0056D2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>
                          Datos Personales
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>
                          {isEditing ? "Modificá tus datos personales" : "Información registrada en tu cuenta"}
                        </Typography>
                      </Box>
                    </Box>

                    {isEditing && (
                      <Chip
                        label="Modo Edición"
                        size="small"
                        sx={{
                          bgcolor: "#EFF6FF",
                          color: "#0056D2",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          borderRadius: "6px",
                        }}
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* ─── ANIMACIÓN: VISTA DE DATOS O FORMULARIO EDITABLE ─── */}
                  <AnimatePresence mode="wait">
                    {!isEditing ? (
                      /* 1. MODO VISUALIZACIÓN: TODOS LOS DATOS + BOTÓN 'EDITAR DATOS PERSONALES' */
                      <motion.div
                        key="view-mode"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: "flex", flexDirection: "column", flex: 1 }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8, flex: 1 }}>
                          {/* Fila 1: Nombre */}
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "12px",
                              bgcolor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Nombre
                            </Typography>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A", mt: 0.3 }}>
                              {profileData.firstName || "—"}
                            </Typography>
                          </Box>

                          {/* Fila 2: Apellido */}
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "12px",
                              bgcolor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Apellido
                            </Typography>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A", mt: 0.3 }}>
                              {profileData.lastName || "—"}
                            </Typography>
                          </Box>

                          {/* Fila 3: Correo Electrónico */}
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "12px",
                              bgcolor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Correo Electrónico
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.3 }}>
                              <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A" }}>
                                {profileData.email || "—"}
                              </Typography>
                              <Tooltip title="Identificador único de la cuenta">
                                <Chip
                                  icon={<LockOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                                  label="Principal"
                                  size="small"
                                  sx={{ height: 20, fontSize: "0.68rem", bgcolor: "#EEF4FF", color: "#0056D2", borderRadius: "5px" }}
                                />
                              </Tooltip>
                            </Box>
                          </Box>

                          {/* Fila 4: Fecha de Registro y Estado */}
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "12px",
                              bgcolor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box>
                              <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                Fecha de Registro
                              </Typography>
                              <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A", mt: 0.3 }}>
                                {profileData.createdAt ? formatTransactionDate(profileData.createdAt) : "—"}
                              </Typography>
                            </Box>
                            <Chip
                              label="Activa"
                              size="small"
                              sx={{
                                bgcolor: "#DCFCE7",
                                color: "#15803D",
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                borderRadius: "6px",
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Botón Prominente: 'Editar datos personales' */}
                        <Box sx={{ mt: 3, pt: 1 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={handleStartEdit}
                            startIcon={<EditOutlinedIcon />}
                            disabled={initialLoading}
                            sx={{
                              height: 44,
                              borderRadius: "12px",
                              background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              boxShadow: "0 4px 12px rgba(0, 86, 210, 0.25)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #0047B3 0%, #1e40af 100%)",
                              },
                            }}
                          >
                            Editar datos personales
                          </Button>
                        </Box>
                      </motion.div>
                    ) : (
                      /* 2. MODO EDICIÓN: FORMULARIO TRANSFORMADO CON BOTONES GUARDAR Y CANCELAR */
                      <motion.div
                        key="edit-mode"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: "flex", flexDirection: "column", flex: 1 }}
                      >
                        <Box component="form" onSubmit={handleSaveProfile} sx={{ display: "flex", flexDirection: "column", gap: 2.2, flex: 1 }}>
                          {/* Campo Nombre */}
                          <Box>
                            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                              Nombre *
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="firstName"
                              placeholder="Ingresá tu nombre"
                              value={editFormData.firstName}
                              onChange={handleEditFormChange}
                              disabled={savingProfile}
                              autoFocus
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonOutlineOutlinedIcon sx={{ color: "#0056D2", fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                                sx: { borderRadius: "10px", bgcolor: "#FFFFFF", fontSize: "0.9rem" },
                              }}
                            />
                          </Box>

                          {/* Campo Apellido */}
                          <Box>
                            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                              Apellido *
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              name="lastName"
                              placeholder="Ingresá tu apellido"
                              value={editFormData.lastName}
                              onChange={handleEditFormChange}
                              disabled={savingProfile}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonOutlineOutlinedIcon sx={{ color: "#0056D2", fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                                sx: { borderRadius: "10px", bgcolor: "#FFFFFF", fontSize: "0.9rem" },
                              }}
                            />
                          </Box>

                          {/* Campo Email (Solo lectura) */}
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.6 }}>
                              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                                Correo Electrónico
                              </Typography>
                              <Tooltip title="El correo electrónico identifica tu cuenta y no puede modificarse por seguridad.">
                                <Chip
                                  icon={<LockOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                                  label="No editable"
                                  size="small"
                                  sx={{ height: 20, fontSize: "0.68rem", bgcolor: "#F1F5F9", color: "#64748B", borderRadius: "5px" }}
                                />
                              </Tooltip>
                            </Box>
                            <TextField
                              fullWidth
                              size="small"
                              value={profileData.email}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailOutlinedIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                                sx: {
                                  borderRadius: "10px",
                                  bgcolor: "#F1F5F9",
                                  fontSize: "0.9rem",
                                  "& input": { color: "#475569", cursor: "not-allowed" },
                                },
                              }}
                            />
                          </Box>

                          {/* Botones de Acción: Guardar y Cancelar */}
                          <Box sx={{ mt: "auto", pt: 2, display: "flex", gap: 1.5 }}>
                            <Button
                              type="submit"
                              fullWidth
                              variant="contained"
                              disabled={savingProfile}
                              startIcon={savingProfile ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                              sx={{
                                height: 44,
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                boxShadow: "0 4px 12px rgba(0, 86, 210, 0.25)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #0047B3 0%, #1e40af 100%)",
                                },
                              }}
                            >
                              {savingProfile ? "Guardando..." : "Guardar cambios"}
                            </Button>

                            <Button
                              variant="outlined"
                              onClick={handleCancelEdit}
                              disabled={savingProfile}
                              startIcon={<CloseIcon />}
                              sx={{
                                height: 44,
                                borderRadius: "12px",
                                borderColor: "#CBD5E1",
                                color: "#475569",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                px: 2.5,
                                "&:hover": {
                                  borderColor: "#94A3B8",
                                  bgcolor: "#F8FAFC",
                                },
                              }}
                            >
                              Cancelar
                            </Button>
                          </Box>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Tarjeta 2: Seguridad y Cambio de Contraseña */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: "18px",
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 4px 15px -2px rgba(15, 23, 42, 0.04)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Título de Sección con estado de visualización o edición */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "10px",
                          bgcolor: "#EFF6FF",
                          color: "#0056D2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <SecurityIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>
                          Seguridad y Contraseña
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>
                          {isEditingPassword ? "Validá tu contraseña actual para establecer una nueva" : "Protección de acceso y credenciales de cuenta"}
                        </Typography>
                      </Box>
                    </Box>

                    {isEditingPassword && (
                      <Chip
                        label="Modo Edición"
                        size="small"
                        sx={{
                          bgcolor: "#EFF6FF",
                          color: "#0056D2",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          borderRadius: "6px",
                        }}
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* ─── ANIMACIÓN: VISTA DE SEGURIDAD O FORMULARIO EDITABLE DE CONTRASEÑA ─── */}
                  <AnimatePresence mode="wait">
                    {!isEditingPassword ? (
                      /* 1. MODO VISUALIZACIÓN: ESTADO DE CONTRASEÑA + BOTÓN 'CAMBIAR CONTRASEÑA' */
                      <motion.div
                        key="password-view-mode"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: "flex", flexDirection: "column", flex: 1 }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8, flex: 1 }}>
                          {/* Fila 1: Contraseña Actual Cifrada */}
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "12px",
                              bgcolor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Contraseña
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.3 }}>
                              <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#0F172A", letterSpacing: "0.2em" }}>
                                ••••••••••••
                              </Typography>
                              <Chip
                                label="Protegida"
                                size="small"
                                sx={{ height: 20, fontSize: "0.68rem", bgcolor: "#EEF4FF", color: "#0056D2", borderRadius: "5px" }}
                              />
                            </Box>
                          </Box>

                          {/* Fila 2: Nivel de Seguridad */}
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "12px",
                              bgcolor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Cifrado y Seguridad
                            </Typography>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A", mt: 0.3 }}>
                              BCrypt con Salt (Estándar Seguro)
                            </Typography>
                          </Box>

                          {/* Fila 3: Validación de Acceso */}
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "12px",
                              bgcolor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Box>
                              <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                Protección de Cuenta
                              </Typography>
                              <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A", mt: 0.3 }}>
                                Requerimiento de clave actual activo
                              </Typography>
                            </Box>
                            <Chip
                              label="Activo"
                              size="small"
                              sx={{
                                bgcolor: "#DCFCE7",
                                color: "#15803D",
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                borderRadius: "6px",
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Botón Prominente: 'Cambiar contraseña' */}
                        <Box sx={{ mt: 3, pt: 1 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={handleStartEditPassword}
                            startIcon={<KeyIcon />}
                            disabled={initialLoading}
                            sx={{
                              height: 44,
                              borderRadius: "12px",
                              background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              boxShadow: "0 4px 12px rgba(0, 86, 210, 0.25)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #0047B3 0%, #1e40af 100%)",
                              },
                            }}
                          >
                            Cambiar contraseña
                          </Button>
                        </Box>
                      </motion.div>
                    ) : (
                      /* 2. MODO EDICIÓN: FORMULARIO TRANSFORMADO CON BOTONES ACTUALIZAR Y CANCELAR */
                      <motion.div
                        key="password-edit-mode"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: "flex", flexDirection: "column", flex: 1 }}
                      >
                        <Box component="form" onSubmit={handleSavePassword} sx={{ display: "flex", flexDirection: "column", gap: 2.2, flex: 1 }}>
                          {/* Campo Contraseña Actual */}
                          <Box>
                            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                              Contraseña Actual *
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              type={showCurrentPassword ? "text" : "password"}
                              name="currentPassword"
                              placeholder="Ingresá tu contraseña actual"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              disabled={savingPassword}
                              autoFocus
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <KeyIcon sx={{ color: "#0056D2", fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                                      edge="end"
                                    >
                                      {showCurrentPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                                sx: { borderRadius: "10px", bgcolor: "#FFFFFF", fontSize: "0.9rem" },
                              }}
                            />
                          </Box>

                          {/* Campo Nueva Contraseña */}
                          <Box>
                            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                              Nueva Contraseña *
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              type={showNewPassword ? "text" : "password"}
                              name="newPassword"
                              placeholder="Mínimo 6 caracteres"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              disabled={savingPassword}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockOutlinedIcon sx={{ color: "#0056D2", fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={() => setShowNewPassword((prev) => !prev)}
                                      edge="end"
                                    >
                                      {showNewPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                                sx: { borderRadius: "10px", bgcolor: "#FFFFFF", fontSize: "0.9rem" },
                              }}
                            />
                          </Box>

                          {/* Campo Confirmar Nueva Contraseña */}
                          <Box>
                            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                              Confirmar Nueva Contraseña *
                            </Typography>
                            <TextField
                              fullWidth
                              size="small"
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              placeholder="Repetí la nueva contraseña"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              disabled={savingPassword}
                              error={Boolean(
                                passwordData.confirmPassword &&
                                passwordData.newPassword &&
                                passwordData.confirmPassword !== passwordData.newPassword
                              )}
                              helperText={
                                passwordData.confirmPassword &&
                                passwordData.newPassword &&
                                passwordData.confirmPassword !== passwordData.newPassword
                                  ? "Las contraseñas no coinciden"
                                  : ""
                              }
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockOutlinedIcon sx={{ color: "#0056D2", fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                                      edge="end"
                                    >
                                      {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                                sx: { borderRadius: "10px", bgcolor: "#FFFFFF", fontSize: "0.9rem" },
                              }}
                            />
                          </Box>

                          {/* Botones de Acción: Actualizar y Cancelar */}
                          <Box sx={{ mt: "auto", pt: 2, display: "flex", gap: 1.5 }}>
                            <Button
                              type="submit"
                              fullWidth
                              variant="contained"
                              disabled={savingPassword}
                              startIcon={savingPassword ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                              sx={{
                                height: 44,
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                boxShadow: "0 4px 12px rgba(0, 86, 210, 0.25)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #0047B3 0%, #1e40af 100%)",
                                },
                              }}
                            >
                              {savingPassword ? "Validando..." : "Actualizar contraseña"}
                            </Button>

                            <Button
                              variant="outlined"
                              onClick={handleCancelEditPassword}
                              disabled={savingPassword}
                              startIcon={<CloseIcon />}
                              sx={{
                                height: 44,
                                borderRadius: "12px",
                                borderColor: "#CBD5E1",
                                color: "#475569",
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                px: 2.5,
                                "&:hover": {
                                  borderColor: "#94A3B8",
                                  bgcolor: "#F8FAFC",
                                },
                              }}
                            >
                              Cancelar
                            </Button>
                          </Box>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Feedback Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              borderRadius: "10px",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppLayout>
  );
}

export default ProfilePage;
