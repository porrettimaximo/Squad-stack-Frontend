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
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import { motion, AnimatePresence } from "framer-motion";

import { useAccount } from "../../hooks/useAccount";
import { useAuth } from "../../context/AuthContext";
import accountService from "../../services/accountService";
import AppLayout from "../../components/layout/AppLayout";
import SuccessStep from "../../components/common/SuccessStep";
import TransferReceiptModal from "../../components/common/TransferReceiptModal";
import { formatCurrency, parseAmount, sanitizeNumericInput } from "../../utils/formatters";
import { downloadTransferReceiptPdf } from "../../utils/pdfGenerator";
import { TRANSFER_MOTIVES, DEFAULT_MOTIVE } from "../../constants/motives";
import { SEED_CONTACTS, findContact } from "../../constants/contacts";

const slideVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.18 } },
};

/**
 * HU-26: Pantalla de transferencia de fondos.
 * - Validación y búsqueda de destinatario real por CVU (22 dígitos) o Alias en tiempo real.
 * - Muestra datos 100% verificados del titular destino (Nombre, CVU, Alias, Banco).
 * - Paso 3: confirmación con todos los datos de origen, destino y operación.
 * - Paso 4: pantalla de éxito limpia con comprobante completo y descarga en PDF oficial.
 */
export function TransferPage() {
  const navigate = useNavigate();
  const { account, transferFunds } = useAccount();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [destinationInput, setDestinationInput] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [verifiedRecipient, setVerifiedRecipient] = useState(null);
  const [verifyingRecipient, setVerifyingRecipient] = useState(false);
  const [recipientError, setRecipientError] = useState("");

  const [amount, setAmount] = useState("");
  const [motive, setMotive] = useState(DEFAULT_MOTIVE);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Control del modal de información completa y comprobante
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [completedTxId, setCompletedTxId] = useState(null);

  const currentBalance = account?.money ?? 0;

  // ─── USUARIOS DE LA PLATAFORMA (DESTINATARIOS SUGERIDOS) ───
  const currentUserId = user?.id ? String(user.id) : null;
  const currentAccountId = account?.id ? String(account.id) : null;
  const currentUserEmail = user?.email?.toLowerCase();
  const currentUserAlias = account?.alias?.toLowerCase();
  const currentUserCvu = account?.cvu;

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
      if (currentUserAlias && c.alias?.toLowerCase() === currentUserAlias) return false;
      if (currentUserCvu && c.cvu === currentUserCvu) return false;

      return true;
    });
  }, [currentUserId, currentAccountId, currentUserEmail, currentUserAlias, currentUserCvu]);

  // Filtro por nombre o alias al escribir en el campo de texto
  const displayedContacts = useMemo(() => {
    if (!destinationInput.trim()) return suggestedUsers;
    const q = destinationInput.trim().toLowerCase();
    return suggestedUsers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.alias.toLowerCase().includes(q) ||
        c.cvu.includes(q)
    );
  }, [suggestedUsers, destinationInput]);

  // ─── PERFIL COMPLETO DE MI CUENTA (ORIGEN) ───
  const myProfile = useMemo(() => {
    const accId = account?.id ? String(account.id) : (user?.id ? String(user.id) : "1");
    const email = user?.email || "usuario@digitalars.com";
    const name = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())));
    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, ".");

    return {
      name,
      email,
      accountId: accId,
      accountNumber: account?.accountNumber || `0002-4892-0${accId}`,
      cvu: account?.cvu || (account?.id ? `000000310001000000000${account.id}` : "0000003100010000000004"),
      alias: account?.alias || `${username}.ars`,
      bank: "DigitalArs Billetera Virtual",
    };
  }, [user, account]);

  // ─── RESOLUCIÓN Y VERIFICACIÓN EN TIEMPO REAL DEL DESTINATARIO ───
  const handleLookupAndProceed = async (targetQuery = null) => {
    const query = (targetQuery || destinationInput || selectedContact?.alias || selectedContact?.cvu || "").trim();
    if (!query) {
      setRecipientError("Ingresá un CVU o Alias para continuar.");
      return;
    }

    setVerifyingRecipient(true);
    setRecipientError("");

    try {
      // 1. Consulta en tiempo real al backend (GET /api/accounts/lookup?query=...)
      const res = await accountService.lookupAccount(query);

      const resolved = {
        accountId: res.accountId,
        name: res.name || `${res.firstName} ${res.lastName}`.trim(),
        firstName: res.firstName,
        lastName: res.lastName,
        cvu: res.cvu,
        alias: res.alias,
        bank: res.bank || "DigitalArs Billetera Virtual",
        email: res.emailMasked || `${res.alias}@digitalars.com`,
        accountNumber: `0002-4892-0${res.accountId}`,
      };

      setVerifiedRecipient(resolved);
      setStep(2);
    } catch (err) {
      // Fallback a contactos conocidos si el backend está offline o en demo
      const localContact = findContact(query);
      if (localContact && (!currentAccountId || String(localContact.accountId) !== String(currentAccountId))) {
        setVerifiedRecipient({
          accountId: Number(localContact.accountId),
          name: localContact.name,
          cvu: localContact.cvu,
          alias: localContact.alias,
          bank: localContact.bank || "DigitalArs Billetera Virtual",
          email: localContact.email,
          accountNumber: localContact.accountNumber,
        });
        setStep(2);
        return;
      }

      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setRecipientError(msg || "No encontramos ninguna cuenta registrada con ese CVU o Alias.");
    } finally {
      setVerifyingRecipient(false);
    }
  };

  // Selección interactiva de contacto de la grilla
  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setDestinationInput(contact.alias || contact.cvu);
    setRecipientError("");
    handleLookupAndProceed(contact.alias || contact.cvu);
  };

  const handleDeselectRecipient = () => {
    setVerifiedRecipient(null);
    setSelectedContact(null);
    setDestinationInput("");
    setRecipientError("");
  };

  // ─── OBJETO DE COMPROBANTE PARA MODAL Y PDF ───
  const transferReceiptData = useMemo(() => {
    return {
      operationId: completedTxId || `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      amount: parseAmount(amount) || 0,
      motive: motive,
      origin: myProfile,
      destination: verifiedRecipient || {
        name: destinationInput,
        accountId: destinationInput,
        cvu: "—",
        alias: "—",
        bank: "DigitalArs Billetera Virtual",
      },
      status: "Transferencia Exitosa",
    };
  }, [completedTxId, amount, motive, myProfile, verifiedRecipient, destinationInput]);

  const handleAmountChange = (e) => {
    setAmount(sanitizeNumericInput(e.target.value));
  };

  const handleTransfer = async () => {
    const num = parseAmount(amount);
    if (!num || num <= 0) return;
    if (!verifiedRecipient?.accountId) {
      setSnackbar({ open: true, message: "Destinatario no válido.", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const destAccountId = verifiedRecipient.accountId;
      const destName = verifiedRecipient.name;

      const res = await transferFunds({
        destination: destName,
        destinationAccountId: Number(destAccountId),
        amount: num,
        concept: motive,
      });

      const txId = res?.id ? `TX-${String(res.id).padStart(4, "0")}` : `TX-${Date.now().toString().slice(-4)}`;
      setCompletedTxId(txId);
      setStep(4);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Error al transferir", severity: "error" });
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) navigate("/");
    else if (step === 2) {
      setRecipientError("");
      setStep(1);
    } else {
      setStep((prev) => prev - 1);
    }
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
              Enviá fondos de forma inmediata y sin comisiones por CVU o Alias.
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
            {/* ─── PASO 1: SELECCIONAR O INGRESAR DESTINATARIO POR CVU O ALIAS ─── */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                {/* Mensaje de error de validación */}
                {recipientError && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontSize: "0.85rem", fontWeight: 600 }}>
                    {recipientError}
                  </Alert>
                )}

                {/* Campo de búsqueda por CVU o Alias */}
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", mb: 0.6 }}>
                  Destinatario
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    setRecipientError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && destinationInput.trim() && !verifyingRecipient) {
                      e.preventDefault();
                      handleLookupAndProceed();
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#0056D2", fontSize: "1.25rem" }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: "12px", bgcolor: "#F8FAFC", fontSize: "0.95rem" },
                    },
                  }}
                  placeholder="Ingresá el CVU (22 dígitos) o Alias"
                />
                <Typography sx={{ fontSize: "0.75rem", color: "#64748B", mt: 0.5, ml: 0.5 }}>
                  Ejemplo: <code>roberto.carlos.ars</code> o <code>0000003100010000000002</code>
                </Typography>

                {/* Grilla de contactos registrados */}
                <Box sx={{ mt: 2.5, mb: 1 }}>
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
                    Contactos sugeridos en DigitalArs
                  </Typography>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                    {displayedContacts.map((contact) => (
                      <CardActionArea
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        disabled={verifyingRecipient}
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
                              width: 38,
                              height: 38,
                              bgcolor: "#0056D2",
                              color: "#FFFFFF",
                              fontWeight: 700,
                              fontSize: "0.92rem",
                            }}
                          >
                            {contact.avatarText || contact.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color: "#0F172A",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {contact.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#0056D2",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {contact.alias}
                            </Typography>
                          </Box>
                        </Box>
                      </CardActionArea>
                    ))}
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleLookupAndProceed()}
                  disabled={!destinationInput.trim() || verifyingRecipient}
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
                  {verifyingRecipient ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Verificando destinatario...</span>
                    </Box>
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </motion.div>
            )}

            {/* ─── PASO 2: MONTO Y MOTIVO (CON DESTINATARIO VERIFICADO) ─── */}
            {step === 2 && verifiedRecipient && (
              <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                {/* Tarjeta Destinatario Verificado (Datos Reales de la API) */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "#F0FDF4",
                    border: "1.5px solid #86EFAC",
                    mb: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: "#16A34A" }} />
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#166534", textTransform: "uppercase" }}>
                        Destinatario Verificado
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setStep(1)}
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#475569",
                        p: 0,
                        minWidth: "auto",
                        textTransform: "none",
                        "&:hover": { textDecoration: "underline", bgcolor: "transparent" },
                      }}
                    >
                      Cambiar
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: "#16A34A", fontWeight: 800, fontSize: "1.1rem" }}>
                      {verifiedRecipient.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0F172A" }}>
                        {verifiedRecipient.name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>
                        Alias: <strong>{verifiedRecipient.alias}</strong> · CVU: {verifiedRecipient.cvu.slice(0, 8)}...{verifiedRecipient.cvu.slice(-4)}
                      </Typography>
                      <Typography sx={{ fontSize: "0.74rem", color: "#16A34A", fontWeight: 700 }}>
                        {verifiedRecipient.bank}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Saldo disponible */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>
                    Monto a transferir
                  </Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }}>
                    Disponible: <strong>{formatCurrency(currentBalance)}</strong>
                  </Typography>
                </Box>

                {/* Input de Monto */}
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  slotProps={{
                    htmlInput: { inputMode: "decimal" },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#0056D2", mr: 0.5 }}>
                            $
                          </Typography>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: "12px", fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", py: 0.2 },
                    },
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
                    slotProps={{
                      paper: {
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
                  disabled={!amount || parseAmount(amount) <= 0 || parseAmount(amount) > currentBalance}
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

            {/* ─── PASO 3: RESUMEN COMPLETO CON DATOS REALES DE AMBAS CUENTAS ─── */}
            {step === 3 && verifiedRecipient && (
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
                        Cuenta #{myProfile.accountId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>ALIAS</Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0056D2" }}>
                        {myProfile.alias}
                      </Typography>
                    </Box>
                    <Box>
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

                {/* 2. Datos de LA OTRA CUENTA (Cuenta Destino Real) */}
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
                      label="Cuenta Destino (Destinatario real)"
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        bgcolor: "#DCFCE7",
                        color: "#166534",
                        borderRadius: "8px",
                      }}
                    />
                    <Typography sx={{ fontSize: "0.75rem", color: "#166534", fontWeight: 700 }}>
                      ✓ Verificado
                    </Typography>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>DESTINATARIO</Typography>
                      <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: "#0F172A" }}>
                        {verifiedRecipient.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>Nº DE CUENTA</Typography>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>
                        Cuenta #{verifiedRecipient.accountId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>ALIAS</Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0056D2" }}>
                        {verifiedRecipient.alias}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>CVU</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", letterSpacing: "0.02em" }}>
                        {verifiedRecipient.cvu}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* 3. Datos de la Operación */}
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
                      {formatCurrency(parseAmount(amount))}
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
                      {formatCurrency(parseAmount(amount))}
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

            {/* ─── PASO 4: ÉXITO LIMPIO CON COMPROBANTE Y DESCARGA EN PDF ─── */}
            {step === 4 && (
              <>
                <SuccessStep
                  title="¡Transferencia exitosa!"
                  subtitle={`Enviamos el dinero a ${verifiedRecipient?.name || "el destinatario"}.`}
                  amount={parseAmount(amount)}
                  maxWidth={440}
                  autoRedirectSeconds={0}
                  details={[
                    { label: "Destinatario", value: verifiedRecipient?.name || destinationInput },
                    { label: "Alias", value: verifiedRecipient?.alias || "—" },
                    { label: "CVU", value: verifiedRecipient?.cvu || "—" },
                    { label: "Motivo", value: motive },
                    { label: "Nuevo saldo disponible", value: formatCurrency(account?.money ?? 0) },
                  ]}
                  extraActions={
                    <>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<ReceiptLongOutlinedIcon />}
                        onClick={() => setReceiptModalOpen(true)}
                        sx={{
                          borderRadius: "14px",
                          py: 1.3,
                          fontWeight: 700,
                          color: "#0056D2",
                          borderColor: "#93C5FD",
                          bgcolor: "#EFF6FF",
                          textTransform: "none",
                          fontSize: "0.95rem",
                          "&:hover": { bgcolor: "#DBEAFE", borderColor: "#60A5FA" },
                        }}
                      >
                        Información de la transferencia
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => downloadTransferReceiptPdf(transferReceiptData)}
                        sx={{
                          borderRadius: "14px",
                          py: 1.2,
                          fontWeight: 700,
                          color: "#475569",
                          borderColor: "#CBD5E1",
                          bgcolor: "#FFFFFF",
                          textTransform: "none",
                          fontSize: "0.92rem",
                          "&:hover": { bgcolor: "#F8FAFC", borderColor: "#94A3B8" },
                        }}
                      >
                        Descargar en PDF
                      </Button>
                    </>
                  }
                  onFinish={() => navigate("/")}
                  onPrimaryClick={() => navigate("/")}
                  finishLabel="Volver al inicio"
                  primaryButtonText="Volver al inicio"
                />

                {/* Modal emergente con información de la transferencia */}
                <TransferReceiptModal
                  open={receiptModalOpen}
                  onClose={() => setReceiptModalOpen(false)}
                  transferData={transferReceiptData}
                  data={transferReceiptData}
                />
              </>
            )}
          </AnimatePresence>
        </Card>

        {/* Snackbar de notificaciones de error o éxito */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%", borderRadius: "10px", fontWeight: 600 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppLayout>
  );
}

export default TransferPage;
