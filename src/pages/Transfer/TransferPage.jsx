import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Snackbar,
  Alert,
  InputAdornment,
  Avatar,
  Chip,
  Divider,
  CardActionArea,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

import { useAccount } from "../../hooks/useAccount";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";
import SuccessStep from "../../components/common/SuccessStep";
import { formatCurrency } from "../../utils/formatters";
import { TRANSFER_MOTIVES, DEFAULT_MOTIVE } from "../../constants/motives";
import { SEED_CONTACTS, findContact } from "../../constants/contacts";

const slideVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.18 } },
};

/**
 * HU-26: Pantalla de transferencia de fondos.
 * Destinatarios sugeridos: todos los usuarios de la plataforma que no sean administradores ni el usuario actual.
 * Muestra únicamente el nombre del destinatario (sin números de cuenta, emails, alias ni CBU/CVU).
 */
export function TransferPage() {
  const navigate = useNavigate();
  const { account, transferFunds } = useAccount();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);
  const [destinationInput, setDestinationInput] = useState("");
  const [amount, setAmount] = useState("");
  const [motive, setMotive] = useState(DEFAULT_MOTIVE);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const currentBalance = account?.money ?? 0;

  // Destinatarios sugeridos: todos los usuarios de la plataforma que no sean admins ni el usuario actual
  const currentUserId = user?.id ? String(user.id) : null;
  const currentAccountId = account?.id ? String(account.id) : null;
  const currentUserEmail = user?.email?.toLowerCase();

  const suggestedUsers = useMemo(() => {
    return SEED_CONTACTS.filter((c) => {
      // Excluir administradores
      const isEmailAdmin = c.email?.toLowerCase().includes("admin");
      const isNameAdmin = c.name?.toLowerCase().includes("admin");
      if (isEmailAdmin || isNameAdmin) return false;

      // Excluir al usuario actualmente autenticado
      if (currentUserId && String(c.id) === currentUserId) return false;
      if (currentAccountId && String(c.accountId) === currentAccountId) return false;
      if (currentUserEmail && c.email?.toLowerCase() === currentUserEmail) return false;

      return true;
    });
  }, [currentUserId, currentAccountId, currentUserEmail]);

  // Filtro dinámico por nombre si el usuario escribe en el buscador
  const displayedContacts = useMemo(() => {
    if (!destinationInput.trim()) return suggestedUsers;
    const q = destinationInput.trim().toLowerCase();
    if (selectedContact && selectedContact.name.toLowerCase() === q) return suggestedUsers;
    return suggestedUsers.filter((c) => c.name.toLowerCase().includes(q));
  }, [suggestedUsers, destinationInput, selectedContact]);

  // Selección/deselección interactiva de contacto
  const handleSelectContact = (contact) => {
    if (selectedContact?.accountId === contact.accountId) {
      setSelectedContact(null);
      setDestinationInput("");
    } else {
      setSelectedContact(contact);
      setDestinationInput(contact.name);
    }
  };

  const handleDeselectContact = () => {
    setSelectedContact(null);
    setDestinationInput("");
  };

  const activeContact =
    selectedContact ||
    suggestedUsers.find(
      (c) =>
        c.name.toLowerCase() === destinationInput.trim().toLowerCase() ||
        c.accountId === destinationInput.trim() ||
        c.id === destinationInput.trim()
    ) ||
    findContact(destinationInput);

  const destinationDisplay = activeContact ? activeContact.name : destinationInput;

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  const handleTransfer = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return;

    setLoading(true);
    try {
      const destAccountId = activeContact ? activeContact.accountId : destinationInput;
      const destName = activeContact ? activeContact.name : destinationInput;

      await transferFunds({
        destination: destName,
        destinationAccountId: Number(destAccountId),
        amount: num,
        concept: motive,
      });
      setStep(4);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Error al transferir", severity: "error" });
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) navigate("/");
    else setStep((prev) => prev - 1);
  };

  return (
    <AppLayout onBack={step < 4 ? handleBack : null} maxWidth={600}>
      <Box sx={{ maxWidth: 540, mx: "auto", width: "100%" }}>
        {/* Cabecera compacta */}
        {step < 4 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "#0F172A", fontSize: { xs: "1.5rem", md: "1.75rem" } }}
            >
              Transferir dinero
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>
              Enviá fondos de forma inmediata y sin comisiones.
            </Typography>
          </Box>
        )}

        <Card
          elevation={0}
          sx={{
            borderRadius: "20px",
            p: { xs: 2.5, md: 3 },
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 8px 25px -8px rgba(15, 23, 42, 0.08)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AnimatePresence mode="wait">
            {/* ─── PASO 1: SELECCIONAR O INGRESAR DESTINATARIO ─── */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                {selectedContact ? (
                  /* Tarjeta Destinatario Seleccionado: ÚNICAMENTE NOMBRE */
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: "14px",
                      bgcolor: "#F0FDF4",
                      border: "1.5px solid #86EFAC",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: "#16A34A",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                        }}
                      >
                        {selectedContact.avatarText || selectedContact.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0F172A" }}>
                          {selectedContact.name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "#16A34A", fontWeight: 700 }}>
                          ✓ Destinatario seleccionado
                        </Typography>
                      </Box>
                    </Box>

                    {/* Botón para cambiar destinatario */}
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                      onClick={handleDeselectContact}
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#475569",
                        borderColor: "#CBD5E1",
                        bgcolor: "#FFFFFF",
                        "&:hover": { bgcolor: "#F8FAFC", borderColor: "#94A3B8" },
                      }}
                    >
                      Cambiar
                    </Button>
                  </Paper>
                ) : (
                  <>
                    {/* Campo de búsqueda por nombre */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Destinatario"
                      variant="outlined"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineOutlinedIcon sx={{ color: "#94A3B8", fontSize: "1.2rem" }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: "12px", bgcolor: "#F8FAFC", fontSize: "0.95rem" },
                      }}
                      placeholder="Buscar destinatario por nombre"
                    />

                    {/* Grilla de contactos sugeridos: ÚNICAMENTE NOMBRE */}
                    <Box sx={{ mt: 2.2, mb: 1 }}>
                      <Typography
                        sx={{
                          color: "#64748B",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 1.2,
                        }}
                      >
                        <HistoryOutlinedIcon sx={{ fontSize: "1rem", color: "#0056D2" }} />
                        Destinatarios sugeridos
                      </Typography>

                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                        {displayedContacts.map((contact) => (
                          <CardActionArea
                            key={contact.id}
                            onClick={() => handleSelectContact(contact)}
                            sx={{
                              p: 1.4,
                              borderRadius: "12px",
                              bgcolor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              transition: "all 0.15s ease",
                              "&:hover": { bgcolor: "#EFF6FF", borderColor: "#93C5FD" },
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: "#0056D2",
                                  color: "#FFFFFF",
                                  fontWeight: 700,
                                  fontSize: "0.9rem",
                                }}
                              >
                                {contact.avatarText || contact.name?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.92rem",
                                  color: "#0F172A",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {contact.name}
                              </Typography>
                            </Box>
                          </CardActionArea>
                        ))}
                      </Box>
                    </Box>
                  </>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setStep(2)}
                  disabled={!destinationInput.trim() && !selectedContact}
                  sx={{
                    bgcolor: "#0056D2",
                    color: "#FFF",
                    borderRadius: "12px",
                    py: 1.4,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    mt: 2,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0047b3" },
                  }}
                >
                  Continuar
                </Button>
              </motion.div>
            )}

            {/* ─── PASO 2: MONTO Y MOTIVO (CON LOS 18 MOTIVOS OFICIALES) ─── */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                {/* Destinatario resumen compacto: SOLO NOMBRE */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.2,
                    bgcolor: "#EFF6FF",
                    borderRadius: "12px",
                    border: "1px solid #BFDBFE",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: "#0056D2", fontSize: "0.75rem" }}>
                      {(destinationDisplay || "D").charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#1E3A8A" }}>
                      {destinationDisplay}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                    Saldo: <strong>{formatCurrency(currentBalance)}</strong>
                  </Typography>
                </Box>

                {/* Input de Monto */}
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", mb: 0.5 }}>
                  Monto a transferir
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={amount ? `$ ${Number(amount).toLocaleString("es-AR")}` : ""}
                  onChange={handleAmountChange}
                  placeholder="$ 0,00"
                  inputProps={{ inputMode: "numeric" }}
                  InputProps={{
                    sx: { borderRadius: "12px", fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", py: 0.2 },
                  }}
                  sx={{ mb: 2 }}
                />

                {/* Selector de Motivo (18 motivos oficiales) */}
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", mb: 0.5 }}>
                  Motivo de la transferencia
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="motive-select-label">Motivo</InputLabel>
                  <Select
                    labelId="motive-select-label"
                    value={motive}
                    label="Motivo"
                    onChange={(e) => setMotive(e.target.value)}
                    sx={{ borderRadius: "12px", bgcolor: "#F8FAFC", fontSize: "0.9rem" }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 240,
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        },
                      },
                    }}
                  >
                    {TRANSFER_MOTIVES.map((m) => (
                      <MenuItem key={m.id} value={m.label} sx={{ fontSize: "0.88rem", py: 1 }}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setStep(3)}
                  disabled={!amount || Number(amount) <= 0 || Number(amount) > currentBalance}
                  sx={{
                    bgcolor: "#0056D2",
                    color: "#FFF",
                    borderRadius: "12px",
                    py: 1.4,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0047b3" },
                  }}
                >
                  Continuar
                </Button>
              </motion.div>
            )}

            {/* ─── PASO 3: RESUMEN Y CONFIRMACIÓN: ÚNICAMENTE NOMBRE ─── */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                <Typography sx={{ color: "#0F172A", fontSize: "1rem", fontWeight: 700, mb: 2 }}>
                  Confirmá los datos de la transferencia
                </Typography>

                {/* Ficha del Destinatario: ÚNICAMENTE NOMBRE */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>Destinatario</Typography>
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
                      {destinationDisplay}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 0.5 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>Motivo</Typography>
                    <Chip label={motive} size="small" sx={{ fontWeight: 700, bgcolor: "#EFF6FF", color: "#0056D2" }} />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>Comisión</Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#10B981" }}>
                      Gratis ($ 0,00)
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5, pt: 1, borderTop: "1px dashed #CBD5E1" }}>
                    <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.95rem" }}>
                      Total a debitar
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.15rem" }}>
                      {formatCurrency(Number(amount))}
                    </Typography>
                  </Box>
                </Paper>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleTransfer}
                  disabled={loading}
                  sx={{
                    bgcolor: "#0056D2",
                    color: "#FFF",
                    borderRadius: "12px",
                    py: 1.4,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0047b3" },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : "Confirmar Transferencia"}
                </Button>
              </motion.div>
            )}

            {/* ─── PASO 4: ÉXITO: ÚNICAMENTE NOMBRE ─── */}
            {step === 4 && (
              <SuccessStep
                title="¡Transferencia exitosa!"
                subtitle={`Enviamos el dinero a ${destinationDisplay}.`}
                amount={Number(amount)}
                details={[
                  { label: "Destinatario", value: destinationDisplay },
                  { label: "Motivo", value: motive },
                  { label: "Nuevo saldo disponible", value: formatCurrency(account?.money ?? 0) },
                ]}
                onFinish={() => navigate("/")}
              />
            )}
          </AnimatePresence>
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%", borderRadius: "12px" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}

export default TransferPage;
