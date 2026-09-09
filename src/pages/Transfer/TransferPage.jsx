import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Avatar,
  Chip,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  CardActionArea,
  Paper,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import AppLayout from "../../components/layout/AppLayout";
import SuccessStep from "../../components/common/SuccessStep";
import TransferReceiptModal from "../../components/common/TransferReceiptModal";
import { useAccount } from "../../hooks/useAccount";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils/formatters";
import { downloadTransferReceiptPdf } from "../../utils/pdfGenerator";
import { accountService } from "../../services/accountService";

// Contactos sugeridos para selección rápida
const SUGGESTED_CONTACTS = [
  { id: 1, accountId: 2, name: "Roberto Carlos", cvu: "0000003100010000000002", alias: "roberto.carlos.ars", email: "roberto.carlos@digitalars.com", accountNumber: "0002-4892-02", avatar: "RC" },
  { id: 2, accountId: 3, name: "María Elena Walsh", cvu: "0000003100010000000003", alias: "maria.walsh.ars", email: "maria.walsh@digitalars.com", accountNumber: "0002-4892-03", avatar: "MW" },
  { id: 3, accountId: 4, name: "Lionel Andrés Messi", cvu: "0000003100010000000004", alias: "lio.messi.ars", email: "lio.messi@digitalars.com", accountNumber: "0002-4892-04", avatar: "LM" },
  { id: 4, accountId: 5, name: "Lucía Méndez", cvu: "0000003100010000000005", alias: "lucia.mendez.ars", email: "lucia.mendez@digitalars.com", accountNumber: "0002-4892-05", avatar: "LM" },
];

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000];
const MOTIVES = ["Varios", "Alquiler", "Servicios", "Expensas", "Factura", "Honorarios", "Préstamo"];

const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

function TransferPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { account, transferFunds, reserves } = useAccount();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [destinationInput, setDestinationInput] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [verifiedRecipient, setVerifiedRecipient] = useState(null);
  const [verifyingRecipient, setVerifyingRecipient] = useState(false);
  const [recipientError, setRecipientError] = useState("");

  const [amount, setAmount] = useState("");
  const [motive, setMotive] = useState("Varios");
  const [sourceType, setSourceType] = useState("account"); // 'account' o 'reserve'
  const [selectedReserveId, setSelectedReserveId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [completedTxId, setCompletedTxId] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const currentBalance = account?.money ?? 0;
  const currentAccountId = account?.id || user?.accountId;

  // Filtrar para que el usuario no se transfiera a sí mismo en los sugeridos
  const displayedContacts = useMemo(() => {
    return SUGGESTED_CONTACTS.filter(
      (c) => !currentAccountId || String(c.accountId) !== String(currentAccountId)
    );
  }, [currentAccountId]);

  // Si venimos con parámetros por estado (ej: desde reservas)
  useEffect(() => {
    if (location.state?.fromReserveId) {
      setSourceType("reserve");
      setSelectedReserveId(location.state.fromReserveId);
    }
  }, [location.state]);

  const selectedReserve = useMemo(() => {
    if (sourceType !== "reserve" || !selectedReserveId) return null;
    return reserves?.find((r) => r.id === selectedReserveId) || null;
  }, [sourceType, selectedReserveId, reserves]);

  const availableSourceBalance = useMemo(() => {
    if (sourceType === "reserve") {
      return selectedReserve?.currentAmount ?? 0;
    }
    return currentBalance;
  }, [sourceType, selectedReserve, currentBalance]);

  // Perfil del emisor para comprobante y resumen
  const myProfile = useMemo(() => {
    const fullName = user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || "Usuario DigitalArs";
    return {
      name: fullName,
      email: user?.email || "tu-email@digitalars.com",
      accountId: account?.id || user?.accountId || 1,
      accountNumber: `0002-4892-0${account?.id || user?.accountId || 1}`,
      alias: account?.alias || user?.alias || "mi.alias.digitalars",
      cvu: account?.cvu || user?.cvu || "0000003100010000000001",
      bank: "DigitalArs Billetera Virtual",
    };
  }, [user, account]);

  // Sanitización de importe
  const parseAmount = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9.,]/g, "").replace(",", ".");
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  };

  const num = parseAmount(amount);

  // Helper para buscar contacto local en mock
  const findContact = (query) => {
    const q = query.trim().toLowerCase();
    return SUGGESTED_CONTACTS.find(
      (c) =>
        c.alias.toLowerCase() === q ||
        c.cvu === q ||
        c.name.toLowerCase().includes(q)
    );
  };

  // Validación y búsqueda de destinatario (Online API + Fallback Local)
  const handleLookupAndProceed = async (overrideQuery) => {
    const query = (overrideQuery || destinationInput).trim();
    if (!query) {
      setRecipientError("Por favor ingresá un CVU (22 dígitos) o Alias válido.");
      return;
    }

    setVerifyingRecipient(true);
    setRecipientError("");

    try {
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

  const handleTransfer = async () => {
    if (!verifiedRecipient) {
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
        reserveId: sourceType === "reserve" ? selectedReserveId : null,
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

  // Datos estructurados completos para comprobante modal y PDF
  const transferReceiptData = useMemo(() => {
    const dest = verifiedRecipient || {};
    return {
      id: completedTxId || "TX-9941",
      date: new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      amount: num,
      concept: motive,
      sender: {
        name: myProfile.name,
        email: myProfile.email,
        accountId: myProfile.accountId,
        accountNumber: myProfile.accountNumber,
        alias: myProfile.alias,
        cvu: myProfile.cvu,
        bank: myProfile.bank,
        sourceType: sourceType === "reserve" ? `Reserva: ${selectedReserve?.name || "Apartado"}` : "Saldo Principal",
      },
      recipient: {
        name: dest.name || "Destinatario",
        accountId: dest.accountId || 2,
        accountNumber: dest.accountNumber || `0002-4892-0${dest.accountId || 2}`,
        alias: dest.alias || "destinatario.ars",
        cvu: dest.cvu || "0000003100010000000002",
        bank: dest.bank || "DigitalArs Billetera Virtual",
      },
    };
  }, [completedTxId, num, motive, myProfile, verifiedRecipient, sourceType, selectedReserve]);

  return (
    <AppLayout onBack={step < 4 ? handleBack : null} maxWidth={620}>
      <Box sx={{ maxWidth: 580, mx: "auto", width: "100%" }}>
        {/* Cabecera */}
        {step < 4 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "text.primary", fontSize: { xs: "1.5rem", md: "1.75rem" } }}
            >
              Transferir dinero
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
              Enviá fondos de forma inmediata y sin comisiones por CVU o Alias.
            </Typography>
          </Box>
        )}

        <Card
          elevation={0}
          sx={{
            borderRadius: "20px",
            p: { xs: 2.5, md: 3 },
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 8px 25px -8px rgba(15, 23, 42, 0.08)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AnimatePresence mode="wait">
            {/* ─── PASO 1: SELECCIONAR O INGRESAR DESTINATARIO POR CVU O ALIAS ─── */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                {recipientError && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontSize: "0.85rem", fontWeight: 600 }}>
                    {recipientError}
                  </Alert>
                )}

                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "text.primary", mb: 0.6 }}>
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
                      sx: { borderRadius: "12px", bgcolor: "background.paper", fontSize: "0.95rem" },
                    },
                  }}
                  placeholder="Ingresá el CVU (22 dígitos) o Alias"
                />
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.5, ml: 0.5 }}>
                  Ejemplo: <code>roberto.carlos.ars</code> o <code>0000003100010000000002</code>
                </Typography>

                {/* Grilla de contactos sugeridos */}
                <Box sx={{ mt: 2.5, mb: 1 }}>
                  <Typography
                    sx={{
                      color: "text.secondary",
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
                          bgcolor: "action.hover",
                          border: "1px solid",
                          borderColor: "divider",
                          transition: "all 0.15s ease",
                          "&:hover": { bgcolor: "action.selected", borderColor: "primary.main" },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: "#0056D2", color: "#FFF", fontSize: "0.85rem", fontWeight: 700 }}>
                            {contact.avatar}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "text.primary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {contact.name}
                            </Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {contact.alias || contact.cvu}
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
                {/* Tarjeta Destinatario Verificado */}
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

                  <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0F172A" }}>
                    {verifiedRecipient.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "#166534", fontWeight: 600 }}>
                    {verifiedRecipient.alias} • CVU {verifiedRecipient.cvu}
                  </Typography>
                </Paper>

                {/* Selector de Origen de los Fondos */}
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                  Origen de los fondos
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <Select
                    value={sourceType === "account" ? "account" : `reserve-${selectedReserveId}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "account") {
                        setSourceType("account");
                        setSelectedReserveId(null);
                      } else {
                        const rId = Number(val.replace("reserve-", ""));
                        setSourceType("reserve");
                        setSelectedReserveId(rId);
                      }
                    }}
                    sx={{ borderRadius: "12px", bgcolor: "background.paper" }}
                  >
                    <MenuItem value="account">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                          Cuenta Principal (Disponible: {formatCurrency(currentBalance)})
                        </Typography>
                      </Box>
                    </MenuItem>
                    {reserves?.map((r) => (
                      <MenuItem key={r.id} value={`reserve-${r.id}`}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <SavingsOutlinedIcon sx={{ fontSize: 18, color: "#16A34A" }} />
                          <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                            Reserva: {r.name} (Disponible: {formatCurrency(r.currentAmount)})
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Campo de Importe */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "text.primary" }}>
                    Monto a transferir
                  </Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                    Disponible: <strong>{formatCurrency(availableSourceBalance)}</strong>
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  variant="outlined"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.,]/g, "");
                    setAmount(val);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "primary.main", mr: 0.5 }}>
                            $
                          </Typography>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: "12px", fontSize: "1.4rem", fontWeight: 800, color: "text.primary", py: 0.2 },
                    },
                  }}
                  placeholder="0,00"
                  error={num > availableSourceBalance}
                  helperText={num > availableSourceBalance ? "Saldo insuficiente en el origen seleccionado" : ""}
                />

                {/* Chips de montos rápidos */}
                <Box sx={{ display: "flex", gap: 1, my: 1.5, flexWrap: "wrap" }}>
                  {QUICK_AMOUNTS.map((q) => (
                    <Chip
                      key={q}
                      label={`+$${q.toLocaleString("es-AR")}`}
                      onClick={() => setAmount(String((num || 0) + q))}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        bgcolor: "action.hover",
                        color: "text.primary",
                        "&:hover": { bgcolor: "primary.light", color: "primary.contrastText" },
                      }}
                    />
                  ))}
                </Box>

                {/* Motivo de la Transferencia */}
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "text.primary", mt: 1.5, mb: 0.5 }}>
                  Motivo de la transferencia
                </Typography>
                <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 2 }}>
                  {MOTIVES.map((m) => (
                    <Chip
                      key={m}
                      label={m}
                      onClick={() => setMotive(m)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        bgcolor: motive === m ? "#0056D2" : "action.hover",
                        color: motive === m ? "#FFF" : "text.primary",
                        cursor: "pointer",
                        "&:hover": { bgcolor: motive === m ? "#0047b3" : "action.selected" },
                      }}
                    />
                  ))}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={!num || num <= 0 || num > availableSourceBalance}
                  onClick={() => setStep(3)}
                  sx={{
                    bgcolor: "#0056D2",
                    color: "#FFF",
                    borderRadius: "12px",
                    py: 1.4,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    mt: 1,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0047b3" },
                  }}
                >
                  Continuar
                </Button>
              </motion.div>
            )}

            {/* ─── PASO 3: CONFIRMACIÓN Y REVISIÓN DE DATOS ─── */}
            {step === 3 && verifiedRecipient && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1.5, textAlign: "center" }}>
                  Revisá con atención los datos de ambas partes antes de confirmar la operación.
                </Typography>

                {/* 1. Datos de TU CUENTA (Emisor) */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Chip
                      label="Tu Cuenta (Emisor)"
                      size="small"
                      sx={{ fontWeight: 800, fontSize: "0.72rem", bgcolor: "primary.light", color: "#FFF", borderRadius: "8px" }}
                    />
                    <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 600 }}>
                      Débito inmediato
                    </Typography>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>TITULAR</Typography>
                      <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: "text.primary" }}>
                        {myProfile.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>Nº DE CUENTA</Typography>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "text.primary" }}>
                        {myProfile.accountNumber}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>EMAIL</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.secondary", wordBreak: "break-all" }}>
                        {myProfile.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>ALIAS</Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0056D2" }}>
                        {myProfile.alias}
                      </Typography>
                    </Box>
                    <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>CVU</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.secondary", letterSpacing: "0.02em" }}>
                        {myProfile.cvu}
                      </Typography>
                    </Box>
                    <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" }, mt: 0.5, pt: 0.8, borderTop: "1px dashed #CBD5E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", fontWeight: 600 }}>FONDOS DEBITADOS DE</Typography>
                      <Chip
                        label={sourceType === "reserve" ? `Reserva: ${selectedReserve?.name || "Apartado"}` : "Saldo Principal de Cuenta"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.74rem",
                          bgcolor: sourceType === "reserve" ? "#DCFCE7" : "#EFF6FF",
                          color: sourceType === "reserve" ? "#15803D" : "#0056D2",
                          borderRadius: "8px",
                        }}
                      />
                    </Box>
                  </Box>
                </Paper>

                {/* Flecha indicadora */}
                <Box sx={{ display: "flex", justifyContent: "center", my: -0.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "#0056D2", color: "#FFFFFF" }}>
                    <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                </Box>

                {/* 2. Datos de LA OTRA CUENTA (Destinatario) */}
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
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>DESTINATARIO</Typography>
                      <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: "text.primary" }}>
                        {verifiedRecipient.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>Nº DE CUENTA</Typography>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "text.primary" }}>
                        {verifiedRecipient.accountNumber}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>EMAIL</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.secondary", wordBreak: "break-all" }}>
                        {verifiedRecipient.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>ALIAS</Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0056D2" }}>
                        {verifiedRecipient.alias}
                      </Typography>
                    </Box>
                    <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>CVU</Typography>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.secondary", letterSpacing: "0.02em" }}>
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
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Monto a transferir</Typography>
                    <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "text.primary" }}>
                      {formatCurrency(num)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Motivo</Typography>
                    <Chip label={motive} size="small" sx={{ fontWeight: 700, bgcolor: "#EFF6FF", color: "#0056D2" }} />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Comisión de transferencia</Typography>
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
                    <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.95rem" }}>
                      Total a debitar
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: "#0056D2", fontSize: "1.25rem" }}>
                      {formatCurrency(num)}
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

            {/* ─── PASO 4: ÉXITO CON INFORMACIÓN DE LA TRANSFERENCIA Y DESCARGA EN PDF ─── */}
            {step === 4 && (
              <>
                <SuccessStep
                  title="¡Transferencia exitosa!"
                  subtitle={`Enviamos el dinero a ${verifiedRecipient?.name || destinationInput}.`}
                  amount={num}
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
                          color: "text.secondary",
                          borderColor: "#CBD5E1",
                          bgcolor: "background.paper",
                          textTransform: "none",
                          fontSize: "0.92rem",
                          "&:hover": { bgcolor: "action.hover", borderColor: "#94A3B8" },
                        }}
                      >
                        Descargar en PDF
                      </Button>
                    </>
                  }
                  finishLabel="Volver al inicio"
                  primaryButtonText="Volver al inicio"
                  onFinish={() => navigate("/")}
                  onPrimaryClick={() => navigate("/")}
                />

                {/* Modal de Información Completa de la Transferencia */}
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
