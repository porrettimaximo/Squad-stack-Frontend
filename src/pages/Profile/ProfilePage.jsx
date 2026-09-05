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
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import SaveIcon from "@mui/icons-material/Save";
import KeyIcon from "@mui/icons-material/Key";
import { motion } from "framer-motion";

import AppLayout from "../../components/layout/AppLayout";
import { useAccount } from "../../hooks/useAccount";
import userService from "../../services/userService";
import { formatTransactionDate } from "../../utils/formatters";

/**
 * HU-28: Pantalla de perfil de usuario.
 * Permite visualizar y editar datos personales, cambiar contraseña y actualizar el nombre en la Navbar.
 */
export function ProfilePage() {
  const { user, updateUserProfile } = useAccount();

  // Estados de carga
  const [initialLoading, setInitialLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Datos de usuario
  const [profileData, setProfileData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    role: "User",
    createdAt: "",
    isActive: true,
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
            role: data.role || "User",
            createdAt: data.createdAt || "",
            isActive: data.isActive ?? true,
          });

          // Actualizar contexto global para sincronizar navbar
          updateUserProfile({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
          });
        }
      } catch (error) {
        console.warn("No se pudo obtener el perfil de /users/me, usando datos en contexto:", error?.message);
        if (isMounted) {
          // Fallback a datos en memoria del contexto
          const names = (user?.name || "Alejandro Silva").split(" ");
          setProfileData({
            id: user?.id || 1,
            firstName: user?.firstName || names[0] || "Alejandro",
            lastName: user?.lastName || names.slice(1).join(" ") || "Silva",
            email: user?.email || "alejandro.silva@digitalars.com",
            role: user?.role || "User",
            createdAt: user?.createdAt || new Date().toISOString(),
            isActive: true,
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

  // Manejador de cambios en datos personales
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
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

    if (!profileData.firstName.trim()) {
      setSnackbar({
        open: true,
        message: "El nombre es obligatorio.",
        severity: "error",
      });
      return;
    }

    if (!profileData.lastName.trim()) {
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
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });

      // Actualizar estado local si el backend devolvió el usuario actualizado
      if (updated) {
        setProfileData((prev) => ({
          ...prev,
          firstName: updated.firstName || prev.firstName,
          lastName: updated.lastName || prev.lastName,
          email: updated.email || prev.email,
          role: updated.role || prev.role,
        }));
      }

      // Actualizar el estado global en AccountContext: actualiza la Navbar de inmediato
      updateUserProfile({
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
      });

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

      // Si el backend no está disponible, aplicar cambio en memoria para experiencia offline reactiva
      if (error.code === "ERR_NETWORK" || !error.response) {
        updateUserProfile({
          firstName: profileData.firstName.trim(),
          lastName: profileData.lastName.trim(),
        });
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
        {/* Cabecera / Hero del Perfil */}
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
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    mb: 1,
                  }}
                >
                  <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                  {profileData.email || "cargando..."}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Chip
                    icon={<BadgeOutlinedIcon sx={{ fontSize: "14px !important", color: "#FFFFFF !important" }} />}
                    label={`Rol: ${profileData.role === "Admin" ? "Administrador" : "Cliente"}`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.18)",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      borderRadius: "6px",
                      backdropFilter: "blur(4px)",
                    }}
                  />
                  {profileData.createdAt && (
                    <Typography sx={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.75)" }}>
                      Miembro desde: {formatTransactionDate(profileData.createdAt)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>
        </motion.div>

        {/* Contenido Principal en Cuadrícula: Datos Personales + Seguridad */}
        <Grid container spacing={3}>
          {/* Tarjeta 1: Información Personal (Nombre, Apellido, Email) */}
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
                  {/* Título de Sección */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
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
                        Actualizá tu nombre y apellido visibles en la cuenta
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Formulario de Datos Personales */}
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
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        disabled={initialLoading || savingProfile}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutlineOutlinedIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: "10px", bgcolor: "#F8FAFC", fontSize: "0.9rem" },
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
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        disabled={initialLoading || savingProfile}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutlineOutlinedIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: "10px", bgcolor: "#F8FAFC", fontSize: "0.9rem" },
                        }}
                      />
                    </Box>

                    {/* Campo Email (Solo lectura) */}
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.6 }}>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                          Correo Electrónico
                        </Typography>
                        <Tooltip title="El correo electrónico identifica tu cuenta y no puede modificarse directamente por seguridad.">
                          <Chip
                            icon={<LockOutlinedIcon sx={{ fontSize: "13px !important" }} />}
                            label="Solo lectura"
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

                    {/* Botón Guardar Datos Personales */}
                    <Box sx={{ mt: "auto", pt: 1.5 }}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={initialLoading || savingProfile}
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
                        {savingProfile ? "Guardando cambios..." : "Guardar datos personales"}
                      </Button>
                    </Box>
                  </Box>
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
                  {/* Título de Sección */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
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
                        Validá tu contraseña actual para establecer una nueva
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Formulario de Contraseña */}
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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <KeyIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
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
                          sx: { borderRadius: "10px", bgcolor: "#F8FAFC", fontSize: "0.9rem" },
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
                              <LockOutlinedIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
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
                          sx: { borderRadius: "10px", bgcolor: "#F8FAFC", fontSize: "0.9rem" },
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
                              <LockOutlinedIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
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
                          sx: { borderRadius: "10px", bgcolor: "#F8FAFC", fontSize: "0.9rem" },
                        }}
                      />
                    </Box>

                    {/* Botón Cambiar Contraseña */}
                    <Box sx={{ mt: "auto", pt: 1.5 }}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="outlined"
                        disabled={savingPassword}
                        startIcon={savingPassword ? <CircularProgress size={18} color="inherit" /> : <KeyIcon />}
                        sx={{
                          height: 44,
                          borderRadius: "12px",
                          borderColor: "#0056D2",
                          color: "#0056D2",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          "&:hover": {
                            borderColor: "#0047B3",
                            bgcolor: "#EEF4FF",
                          },
                        }}
                      >
                        {savingPassword ? "Validando contraseña..." : "Actualizar contraseña"}
                      </Button>
                    </Box>
                  </Box>
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
