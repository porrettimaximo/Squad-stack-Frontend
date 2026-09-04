import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../../components/layout/Sidebar";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import userService from "../../services/userService";

export function AdminUsersPage() {
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  // Estados de la tabla y filtros
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // 0-indexed para MUI TablePagination
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Estados de modales (Crear, Editar, Baja)
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Estados de formularios
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "User",
    initialBalance: "",
  });

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "User",
  });

  // Notificaciones Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Cargar usuarios desde la API (HU-12 / HU-29)
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers({
        page: page + 1, // La API de .NET es 1-indexed
        pageSize,
        name: searchQuery,
        email: searchQuery,
        role: roleFilter,
        isActive: statusFilter === "" ? null : statusFilter === "true",
      });

      if (data && data.items) {
        setUsers(data.items);
        setTotalItems(data.totalItems || data.items.length);
      } else if (Array.isArray(data)) {
        setUsers(data);
        setTotalItems(data.length);
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      // Mock inicial de desarrollo en caso de que la API esté detenida
      setUsers([
        {
          id: 1,
          firstName: "Admin",
          lastName: "Sistema",
          email: "admin@digitalars.com",
          role: "Admin",
          balance: 500000,
          isActive: true,
        },
        {
          id: 2,
          firstName: "Roberto",
          lastName: "Carlos",
          email: "robercarlos3@gmail.com",
          role: "User",
          balance: 260000,
          isActive: true,
        },
        {
          id: 3,
          firstName: "Mohammed",
          lastName: "Kha",
          email: "mokha@gmail.com",
          role: "User",
          balance: 185000.5,
          isActive: true,
        },
      ]);
      setTotalItems(3);
      showNotification("Modo offline: mostrando datos de respaldo.", "info");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  // Manejadores de Paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- ALTA DE USUARIO (HU-12 / HU-29) ---
  const handleOpenCreate = () => {
    setCreateForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "User",
      initialBalance: "0",
    });
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (
      !createForm.firstName ||
      !createForm.lastName ||
      !createForm.email ||
      !createForm.password
    ) {
      showNotification(
        "Por favor completa los campos obligatorios.",
        "warning",
      );
      return;
    }

    setSubmitting(true);
    try {
      await userService.createUser(createForm);
      showNotification(`Usuario ${createForm.email} creado exitosamente.`);
      setCreateOpen(false);
      loadUsers();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al crear usuario.";
      showNotification(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- EDICIÓN DE USUARIO (HU-12 / HU-29) ---
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role || "User",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.firstName || !editForm.lastName || !editForm.email) {
      showNotification(
        "Por favor completa los campos obligatorios.",
        "warning",
      );
      return;
    }

    setSubmitting(true);
    try {
      await userService.updateUser(selectedUser.id, editForm);
      showNotification(`Usuario #${selectedUser.id} actualizado exitosamente.`);
      setEditOpen(false);
      loadUsers();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al actualizar usuario.";
      showNotification(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- BAJA LÓGICA DE USUARIO (HU-12 / HU-29) ---
  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await userService.deleteUser(selectedUser.id);
      showNotification(
        `Usuario ${selectedUser.email} dado de baja correctamente.`,
      );
      setDeleteOpen(false);
      loadUsers();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al dar de baja el usuario.";
      showNotification(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Formateador de moneda
  const formatMoney = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#F4F7FC",
        overflow: "hidden",
      }}
    >
      {/* Sidebar Desktop */}
      {isDesktop && <Sidebar activeItem="admin-users" />}

      {/* Contenedor Principal */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <DashboardNavbar currentTab={0} onTabChange={() => {}} />

        <Box
          sx={{
            p: { xs: 2, md: 4 },
            maxWidth: 1400,
            width: "100%",
            mx: "auto",
          }}
        >
          {/* Header de la Página */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 0.5,
                }}
              >
                <AdminPanelSettingsOutlinedIcon
                  sx={{ color: "#0056D2", fontSize: "2rem" }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#0A192F",
                    fontSize: { xs: "1.5rem", md: "1.85rem" },
                  }}
                >
                  Gestión de Usuarios
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "#64748B", fontWeight: 500 }}
              >
                Administra los usuarios de la plataforma, roles, estado y
                cuentas bancarias (HU-29).
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Tooltip title="Recargar lista">
                <IconButton
                  onClick={loadUsers}
                  sx={{
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                  }}
                >
                  <RefreshOutlinedIcon sx={{ color: "#475569" }} />
                </IconButton>
              </Tooltip>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="contained"
                  startIcon={<PersonAddAlt1OutlinedIcon />}
                  onClick={handleOpenCreate}
                  sx={{
                    bgcolor: "#0056D2",
                    "&:hover": { bgcolor: "#0047B3" },
                    borderRadius: "10px",
                    px: 2.5,
                    py: 1,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(0, 86, 210, 0.25)",
                  }}
                >
                  Nuevo Usuario
                </Button>
              </motion.div>
            </Box>
          </Box>

          {/* Barra de Filtros y Búsqueda */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: "14px",
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#94A3B8" }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: "8px" },
              }}
            />

            <TextField
              select
              size="small"
              label="Rol"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              sx={{ width: 140 }}
              InputProps={{ sx: { borderRadius: "8px" } }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ width: 140 }}
              InputProps={{ sx: { borderRadius: "8px" } }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Activos</MenuItem>
              <MenuItem value="false">Inactivos</MenuItem>
            </TextField>
          </Paper>

          {/* Tabla de Usuarios */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              bgcolor: "#FFFFFF",
              overflow: "hidden",
            }}
          >
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress size={36} sx={{ color: "#0056D2" }} />
              </Box>
            )}

            {!loading && (
              <Table>
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#475569",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Usuario
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#475569",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Rol
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#475569",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Saldo Cuenta
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#475569",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        color: "#475569",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  <AnimatePresence>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{ py: 6, color: "#64748B" }}
                        >
                          No se encontraron usuarios coincidentes.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow
                          key={user.id}
                          component={motion.tr}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          sx={{
                            "&:hover": { bgcolor: "#F8FAFC" },
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          {/* Columna Usuario */}
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor:
                                    user.role === "Admin"
                                      ? "#0A192F"
                                      : "#0056D2",
                                  color: "#FFFFFF",
                                  fontWeight: 700,
                                  fontSize: "0.875rem",
                                  width: 38,
                                  height: 38,
                                }}
                              >
                                {user.firstName
                                  ? user.firstName.charAt(0).toUpperCase()
                                  : "U"}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 700, color: "#0A192F" }}
                                >
                                  {user.firstName} {user.lastName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#64748B" }}
                                >
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Columna Rol */}
                          <TableCell>
                            <Chip
                              label={user.role || "User"}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                bgcolor:
                                  user.role === "Admin"
                                    ? "rgba(10, 25, 47, 0.08)"
                                    : "rgba(0, 86, 210, 0.08)",
                                color:
                                  user.role === "Admin" ? "#0A192F" : "#0056D2",
                                border: `1px solid ${user.role === "Admin" ? "rgba(10, 25, 47, 0.2)" : "rgba(0, 86, 210, 0.2)"}`,
                                borderRadius: "6px",
                              }}
                            />
                          </TableCell>

                          {/* Columna Saldo */}
                          <TableCell sx={{ fontWeight: 700, color: "#0A192F" }}>
                            {formatMoney(user.balance)}
                          </TableCell>

                          {/* Columna Estado */}
                          <TableCell>
                            <Chip
                              icon={
                                user.isActive ? (
                                  <CheckCircleOutlinedIcon
                                    sx={{ fontSize: "1rem !important" }}
                                  />
                                ) : (
                                  <CancelOutlinedIcon
                                    sx={{ fontSize: "1rem !important" }}
                                  />
                                )
                              }
                              label={user.isActive ? "Activo" : "Inactivo"}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                bgcolor: user.isActive
                                  ? "rgba(22, 163, 74, 0.1)"
                                  : "rgba(239, 68, 68, 0.1)",
                                color: user.isActive ? "#16A34A" : "#EF4444",
                                borderRadius: "6px",
                              }}
                            />
                          </TableCell>

                          {/* Columna Acciones */}
                          <TableCell align="right">
                            <Tooltip title="Editar usuario">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(user)}
                                sx={{
                                  color: "#0056D2",
                                  mr: 0.5,
                                  "&:hover": {
                                    bgcolor: "rgba(0, 86, 210, 0.08)",
                                  },
                                }}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Dar de baja">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDelete(user)}
                                sx={{
                                  color: "#EF4444",
                                  "&:hover": {
                                    bgcolor: "rgba(239, 68, 68, 0.08)",
                                  },
                                }}
                              >
                                <DeleteOutlineOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}

            {/* Paginación */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalItems}
              rowsPerPage={pageSize}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
              sx={{ borderTop: "1px solid #E2E8F0" }}
            />
          </TableContainer>
        </Box>
      </Box>

      {/* --- DIALOG DE CREAR USUARIO (HU-29) --- */}
      <Dialog
        open={createOpen}
        onClose={() => !submitting && setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0A192F" }}>
            Nuevo Usuario
          </Typography>
          <IconButton
            onClick={() => setCreateOpen(false)}
            disabled={submitting}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleCreateSubmit}>
          <DialogContent dividers sx={{ borderColor: "#E2E8F0" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Nombre"
                  required
                  value={createForm.firstName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, firstName: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  label="Apellido"
                  required
                  value={createForm.lastName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, lastName: e.target.value })
                  }
                />
              </Box>

              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                required
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                required
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Rol"
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, role: e.target.value })
                  }
                >
                  <MenuItem value="User">Usuario Estándar (User)</MenuItem>
                  <MenuItem value="Admin">Administrador (Admin)</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  label="Saldo Inicial ($)"
                  type="number"
                  value={createForm.initialBalance}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      initialBalance: e.target.value,
                    })
                  }
                  inputProps={{ min: 0, step: "100" }}
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
              sx={{ color: "#64748B", textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                bgcolor: "#0056D2",
                "&:hover": { bgcolor: "#0047B3" },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {submitting ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* --- DIALOG DE EDITAR USUARIO (HU-29) --- */}
      <Dialog
        open={editOpen}
        onClose={() => !submitting && setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0A192F" }}>
            Editar Usuario #{selectedUser?.id}
          </Typography>
          <IconButton onClick={() => setEditOpen(false)} disabled={submitting}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleEditSubmit}>
          <DialogContent dividers sx={{ borderColor: "#E2E8F0" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Nombre"
                  required
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  label="Apellido"
                  required
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                />
              </Box>

              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                required
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />

              <TextField
                select
                fullWidth
                label="Rol"
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
              >
                <MenuItem value="User">Usuario Estándar (User)</MenuItem>
                <MenuItem value="Admin">Administrador (Admin)</MenuItem>
              </TextField>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setEditOpen(false)}
              disabled={submitting}
              sx={{ color: "#64748B", textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                bgcolor: "#0056D2",
                "&:hover": { bgcolor: "#0047B3" },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {submitting ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* --- DIALOG DE CONFIRMACIÓN DE BAJA (HU-29) --- */}
      <Dialog
        open={deleteOpen}
        onClose={() => !submitting && setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ color: "#EF4444", fontWeight: 800 }}>
          ¿Dar de baja usuario?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#475569" }}>
            Estás por realizar la baja lógica del usuario{" "}
            <strong>{selectedUser?.email}</strong>. El usuario no podrá iniciar
            sesión en la plataforma.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            disabled={submitting}
            sx={{ color: "#64748B", textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={submitting}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
          >
            {submitting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Confirmar Baja"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificación Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: "10px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminUsersPage;
