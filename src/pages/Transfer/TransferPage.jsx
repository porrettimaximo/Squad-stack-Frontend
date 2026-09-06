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
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
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
 * - Destinatarios sugeridos: muestra todos los usuarios estándar de la plataforma (no administradores)
 *   mostrando ÚNICAMENTE el nombre para agilidad visual.
 * - Datos de la transferencia (Paso 3 y Paso 4): muestra la ficha completa y detallada
 *   con todos los datos de la cuenta de origen (mi cuenta), de la cuenta de destino (a quién / la otra cuenta),
 *   montos, motivos, comisiones y saldos.
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

  // ─── USUARIOS DE LA PLATAFORMA (DESTINATARIOS SUGERIDOS) ───
  const currentUserId = user?.id ? String(user.id) : null;
  const currentAccountId = account?.id ? String(account.id) : null;
  const currentUserEmail = user?.email?.toLowerCase();

  const suggestedUsers = useMemo(() => {
    return SEED_CONTACTS.filter((c) => {
      // Excluir administradores
      const isEmailAdmin = c.email?.toLowerCase().includes("admin");
      const isNameAdmin = c.name?.toLowerCase().includes("admin");
      if (isEmailAdmin || isNameAdmin) return false;

      // Excluir al usuario actualmente logueado
      if (currentUserId && String(c.id) === currentUserId) return false;
      if (currentAccountId && String(c.accountId) === currentAccountId) return false;
      if (currentUserEmail && c.email?.toLowerCase() === currentUserEmail) return false;

      return true;
    });
  }, [currentUserId, currentAccountId, currentUserEmail]);

  // Filtro por nombre al escribir en el campo de texto
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

  // ─── PERFIL COMPLETO DE MI CUENTA (ORIGEN) ───
  const myProfile = useMemo(() => {
    const accId = account?.id ? String(account.id) : (user?.id ? String(user.id) : "4");
    const fromSeed = findContact(accId) || findContact(user?.id) || findContact(user?.email);
    const email = user?.email || fromSeed?.email || `usuario${accId}@digitalars.com`;
    const name = fromSeed?.name || (email.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()));
    const username = email.split("@")[0];

    return {
      name,
      email,
      accountId: accId,
      accountNumber: fromSeed?.accountNumber || `0002-4892-0${accId}`,
      cvu: fromSeed?.cvu || `000000310001000000000${accId}`,
      alias: fromSeed?.alias || `${username}.ars`,
      bank: fromSeed?.bank || "DigitalArs Billetera Virtual",
    };
  }, [user, account]);

  // ─── PERFIL COMPLETO DE LA OTRA CUENTA (DESTINO / A QUIÉN) ───
  const recipientProfile = useMemo(() => {
    const accId = activeContact?.accountId || destinationInput || "2";
    const fromSeed = activeContact || findContact(accId) || findContact(destinationInput);
    const email = fromSeed?.email || `cuenta${accId}@digitalars.com`;
    const name = fromSeed?.name || destinationDisplay || `Destinatario #${accId}`;
    const username = email.split("@")[0];

    return {
      name,
      email,
      accountId: accId,
      accountNumber: fromSeed?.accountNumber || `0002-4892-0${accId}`,
      cvu: fromSeed?.cvu || `000000310001000000000${accId}`,
      alias: fromSeed?.alias || `${username}.ars`,
      bank: fromSeed?.bank || "DigitalArs Billetera Virtual",
    };
  }, [activeContact, destinationInput, destinationDisplay]);

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  const handleTransfer = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return;

    setLoading(true);
    try {
      const destAccountId = recipientProfile.accountId;
      const destName = recipientProfile.name;

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
    <AppLayout onBack={step < 4 ? handleBack : null} maxWidth={620}>
      <Box sx={{ maxWidth: 580, mx: "auto", width: "100%" }}>
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
                  /* Tarjeta Destinatario Seleccionado: ÚNICAMENTE NOMBRE (Ágil) */
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
                {/* Destinatario resumen */}
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
                      {(recipientProfile.name || "D").charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#1E3A8A" }}>
                      {recipientProfile.name}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                    Saldo disponible: <strong>{formatCurrency(currentBalance)}</strong>
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

            {/* ─── PASO 3: RESUMEN COMPLETO CON TODOS LOS DATOS DE AMBAS CUENTAS ─── */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                <Typography sx={{ color: "#0F172A", fontSize: "1.1rem", fontWeight: 800, mb: 0.5 }}>
                  Confirmá los datos de la transferencia
                </Typography>
                <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>
                  Revisá la cuenta de origen, la cuenta de destino y el detalle antes de confirmar.
                </Typography>

                {/* 1. Datos de MI CUENTA (Cuenta Origen) */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Chip
                      label="Cuenta Origen (Mi cuenta)"
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        bgcolor: "#E0E7FF",
                        color: "#3730A3",
                        borderRadius: "8px",
                      }}
                    />
                    <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                      {myProfile.bank}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>TITULAR</Typography>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>
                        {myProfile.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>Nº DE CUENTA</Typography>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>
                        Cuenta #{myProfile.accountId} ({myProfile.accountNumber})
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>EMAIL</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", wordBreak: "break-all" }}>
                        {myProfile.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>ALIAS</Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0056D2" }}>
                        {myProfile.alias}
                      </Typography>
                    </Box>
                    <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>CVU</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", letterSpacing: "0.02em" }}>
                        {myProfile.cvu}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Flecha indicadora de transferencia */}
                <Box sx={{ display: "flex", justifyContent: "center", my: -0.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "#0056D2", color: "#FFFFFF" }}>
                    <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                </Box>

                {/* 2. Datos de LA OTRA CUENTA (Cuenta Destino / A quién) */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#F0FDF4",
                    border: "1.5px solid #86EFAC",
                    mb: 1.5,
                    mt: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Chip
                      label="Cuenta Destino (A quién)"
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        bgcolor: "#DCFCE7",
                        color: "#166534",
                        borderRadius: "8px",
                      }}
                    />
                    <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                      {recipientProfile.bank}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>DESTINATARIO</Typography>
                      <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: "#0F172A" }}>
                        {recipientProfile.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>Nº DE CUENTA</Typography>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>
                        Cuenta #{recipientProfile.accountId} ({recipientProfile.accountNumber})
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>EMAIL</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", wordBreak: "break-all" }}>
                        {recipientProfile.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>ALIAS</Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0056D2" }}>
                        {recipientProfile.alias}
                      </Typography>
                    </Box>
                    <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>CVU</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", letterSpacing: "0.02em" }}>
                        {recipientProfile.cvu}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* 3. Datos de la Operación (Monto, Motivo, Comisión, Total) */}
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
                    <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>Monto a transferir</Typography>
                    <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A" }}>
                      {formatCurrency(Number(amount))}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>Motivo</Typography>
                    <Chip label={motive} size="small" sx={{ fontWeight: 700, bgcolor: "#EFF6FF", color: "#0056D2" }} />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>Comisión de transferencia</Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#10B981" }}>
                      Gratis ($ 0,00)
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 0.5,
                      pt: 1.2,
                      borderTop: "1px dashed #CBD5E1",
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.95rem" }}>
                      Total a debitar
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: "#0056D2", fontSize: "1.25rem" }}>
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

            {/* ─── PASO 4: COMPROBANTE CON TODOS LOS DATOS DE LA TRANSFERENCIA ─── */}
            {step === 4 && (
              <SuccessStep
                title="¡Transferencia exitosa!"
                subtitle={`El dinero fue enviado correctamente a ${recipientProfile.name}.`}
                amount={Number(amount)}
                maxWidth={520}
                autoRedirectSeconds={0}
                details={[
                  { label: "CUENTA DE ORIGEN (MI CUENTA)", isHeader: true },
                  { label: "Titular Origen", value: myProfile.name },
                  { label: "Nº de Cuenta", value: `Cuenta #${myProfile.accountId} (${myProfile.accountNumber})` },
                  { label: "Email Origen", value: myProfile.email },
                  { label: "Alias Origen", value: myProfile.alias },
                  { label: "CVU Origen", value: myProfile.cvu },
                  { label: "Banco Origen", value: myProfile.bank },

                  { label: "CUENTA DE DESTINO (A QUIÉN)", isHeader: true },
                  { label: "A quién (Titular)", value: recipientProfile.name },
                  { label: "Nº de Cuenta", value: `Cuenta #${recipientProfile.accountId} (${recipientProfile.accountNumber})` },
                  { label: "Email Destino", value: recipientProfile.email },
                  { label: "Alias Destino", value: recipientProfile.alias },
                  { label: "CVU Destino", value: recipientProfile.cvu },
                  { label: "Banco Destino", value: recipientProfile.bank },

                  { label: "DETALLE DE LA OPERACIÓN", isHeader: true },
                  { label: "Monto debitado", value: formatCurrency(Number(amount)) },
                  { label: "Motivo", value: motive },
                  { label: "Comisión", value: "Gratis ($ 0,00)" },
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
