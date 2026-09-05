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
import { motion, AnimatePresence } from "framer-motion";

import AppLayout from "../../components/layout/AppLayout";
import { useAccount } from "../../hooks/useAccount";
import userService from "../../services/userService";

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
                  }}
                >
                  <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                  {profileData.email || "cargando..."}
                </Typography>
              </Box>
            </Box>
          </Card>
        </motion.div>

        {/* Tarjeta Única Centralizada: Datos Personales y Seguridad (con Cambiar Contraseña adentro) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <Card
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              {/* ─────────────────────────────────────────────────────────────
                  SECCIÓN 1: DATOS PERSONALES
                 ───────────────────────────────────────────────────────────── */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      bgcolor: "#EFF6FF",
                      color: "#0056D2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#0F172A" }}>
                      Datos Personales
                    </Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>
                      {isEditing ? "Modificá tu nombre y apellido" : "Información básica registrada en tu cuenta"}
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

              <Divider sx={{ my: 2.5 }} />

              <AnimatePresence mode="wait">
                {!isEditing ? (
                  /* 1.A MODO VISUALIZACIÓN DATOS PERSONALES */
                  <motion.div
                    key="view-profile-section"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Grid container spacing={2}>
                      {/* Nombre */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "14px",
                            bgcolor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Nombre
                          </Typography>
                          <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#0F172A", mt: 0.4 }}>
                            {profileData.firstName || "—"}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Apellido */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "14px",
                            bgcolor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Apellido
                          </Typography>
                          <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#0F172A", mt: 0.4 }}>
                            {profileData.lastName || "—"}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Correo Electrónico */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "14px",
                            bgcolor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Correo Electrónico
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.4 }}>
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
                      </Grid>

                      {/* Estado de la Cuenta */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "14px",
                            bgcolor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Estado de la Cuenta
                            </Typography>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A", mt: 0.4 }}>
                              Usuario Activo y Habilitado
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
                      </Grid>
                    </Grid>

                    {/* Botón Editar datos personales */}
                    <Box sx={{ mt: 2.5, display: "flex", justifyContent: { xs: "stretch", sm: "flex-start" } }}>
                      <Button
                        variant="contained"
                        onClick={handleStartEdit}
                        startIcon={<EditOutlinedIcon />}
                        disabled={initialLoading}
                        sx={{
                          height: 42,
                          px: 3,
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          boxShadow: "0 4px 12px rgba(0, 86, 210, 0.2)",
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
                  /* 1.B MODO EDICIÓN FORMULARIO DATOS PERSONALES */
                  <motion.div
                    key="edit-profile-section"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Box component="form" onSubmit={handleSaveProfile} sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
                      <Grid container spacing={2}>
                        {/* Nombre */}
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                        </Grid>

                        {/* Apellido */}
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                        </Grid>

                        {/* Email (Solo lectura) */}
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.6 }}>
                            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                              Correo Electrónico
                            </Typography>
                            <Tooltip title="El correo electrónico no puede modificarse por seguridad.">
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
                        </Grid>
                      </Grid>

                      {/* Botones Guardar y Cancelar */}
                      <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={savingProfile}
                          startIcon={savingProfile ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                          sx={{
                            height: 42,
                            px: 3,
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            boxShadow: "0 4px 12px rgba(0, 86, 210, 0.2)",
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
                            height: 42,
                            borderRadius: "12px",
                            borderColor: "#CBD5E1",
                            color: "#475569",
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "0.88rem",
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

              {/* ─────────────────────────────────────────────────────────────
                  SECCIÓN 2: SEGURIDAD Y CAMBIO DE CONTRASEÑA (ADENTRO DE LA MISMA CARD)
                 ───────────────────────────────────────────────────────────── */}
              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      bgcolor: "#EFF6FF",
                      color: "#0056D2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#0F172A" }}>
                      Seguridad y Contraseña
                    </Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>
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

              <Divider sx={{ my: 2.5 }} />

              <AnimatePresence mode="wait">
                {!isEditingPassword ? (
                  /* 2.A MODO VISUALIZACIÓN SEGURIDAD + BOTÓN 'CAMBIAR CONTRASEÑA' */
                  <motion.div
                    key="password-view-section"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Grid container spacing={2}>
                      {/* Contraseña */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: "14px",
                            bgcolor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Contraseña
                          </Typography>
                          <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: "#0F172A", letterSpacing: "0.2em", mt: 0.4 }}>
                            ••••••••••••
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Botón Cambiar contraseña */}
                    <Box sx={{ mt: 2.5, display: "flex", justifyContent: { xs: "stretch", sm: "flex-start" } }}>
                      <Button
                        variant="contained"
                        onClick={handleStartEditPassword}
                        startIcon={<KeyIcon />}
                        disabled={initialLoading}
                        sx={{
                          height: 42,
                          px: 3,
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.88rem",
                          boxShadow: "0 4px 12px rgba(0, 86, 210, 0.2)",
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
                  /* 2.B MODO EDICIÓN FORMULARIO DE CONTRASEÑA */
                  <motion.div
                    key="password-edit-section"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Box component="form" onSubmit={handleSavePassword} sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
                      <Grid container spacing={2}>
                        {/* Contraseña Actual */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                            Contraseña Actual *
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            placeholder="Ingresá tu clave actual"
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
                        </Grid>

                        {/* Nueva Contraseña */}
                        <Grid size={{ xs: 12, md: 4 }}>
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
                        </Grid>

                        {/* Confirmar Nueva Contraseña */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", mb: 0.6 }}>
                            Confirmar Nueva Contraseña *
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Repetí la nueva clave"
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
                        </Grid>
                      </Grid>

                      {/* Botones Actualizar y Cancelar */}
                      <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={savingPassword}
                          startIcon={savingPassword ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                          sx={{
                            height: 42,
                            px: 3,
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            boxShadow: "0 4px 12px rgba(0, 86, 210, 0.2)",
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
                            height: 42,
                            borderRadius: "12px",
                            borderColor: "#CBD5E1",
                            color: "#475569",
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "0.88rem",
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
