import React, { useState, useEffect } from "react";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { motion, AnimatePresence } from "framer-motion";

import { useAccount } from "../../hooks/useAccount";
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
 * Diseño compacto sin scroll, con selección/deselección interactiva,
 * ficha completa del destinatario y selector de los 18 motivos oficiales.
 */
export function TransferPage() {
  const navigate = useNavigate();
  const { account, transferFunds, transactions } = useAccount();

  const [step, setStep] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);
  const [destinationInput, setDestinationInput] = useState("");
  const [amount, setAmount] = useState("");
  const [motive, setMotive] = useState(DEFAULT_MOTIVE);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [contactList, setContactList] = useState(SEED_CONTACTS);

  const currentBalance = account?.money ?? 0;

  // Carga y filtra destinatarios de transferencias recientes
  useEffect(() => {
    const nonTransferCategories = [
      "COMPRAS",
      "COMIDA",
      "SERVICIOS",
      "SUSCRIPCION",
      "SUSCRIPCIÓN",
      "GASTO",
      "CONSUMO",
    ];
    const merchantKeywords = [
      "mercado libre",
      "netflix",
      "starbucks",
      "spotify",
      "uber",
      "pedidosya",
      "rappi",
      "amazon",
    ];

    const outgoing = (transactions || []).filter((t) => {
      const cat = (t.category || "").toUpperCase();
      if (nonTransferCategories.some((nc) => cat.includes(nc))) return false;

      const tit = (t.title || "").toLowerCase();
      if (merchantKeywords.some((m) => tit.includes(m))) return false;

      return t.type === 3 || Boolean(t.toAccountId);
    });

    const seenIds = new Set(SEED_CONTACTS.map((c) => c.accountId));
    const dynamicList = [...SEED_CONTACTS];

    outgoing.forEach((t) => {
      const accId = t.toAccountId ? String(t.toAccountId) : "";
      if (accId && !seenIds.has(accId)) {
        seenIds.add(accId);
        const contact = findContact(accId);
        if (contact) {
          dynamicList.push(contact);
        } else {
          dynamicList.push({
            id: `tx-${t.id}`,
            name: t.title?.replace(/transferencia (enviada )?a /i, "").trim() || `Cuenta #${accId}`,
            email: `cuenta${accId}@digitalars.com`,
            accountId: accId,
            accountNumber: `0002-4892-0${accId}`,
            cvu: `000000310001000000000${accId}`,
            alias: `usuario${accId}.ars`,
            bank: "DigitalArs Billetera Virtual",
            avatarText: (t.title || "U").charAt(0).toUpperCase(),
          });
        }
      }
    });

    setContactList(dynamicList);
  }, [transactions]);

  // Manejador de selección/deselección de contacto
  const handleSelectContact = (contact) => {
    if (selectedContact?.accountId === contact.accountId) {
      // Deseleccionar si se vuelve a cliquear
      setSelectedContact(null);
      setDestinationInput("");
    } else {
      setSelectedContact(contact);
      setDestinationInput(contact.accountId);
    }
  };

  const handleDeselectContact = () => {
    setSelectedContact(null);
    setDestinationInput("");
  };

  const activeContact = selectedContact || findContact(destinationInput);
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
        destinationAccountId: destAccountId,
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
                <Typography sx={{ color: "#0F172A", fontSize: "1rem", fontWeight: 700, mb: 1.5 }}>
                  Destinatario
                </Typography>

                {/* Si hay un contacto seleccionado, mostrar su ficha completa con opción de deseleccionar */}
                {selectedContact ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: "16px",
                      bgcolor: "#F0FDF4",
                      border: "1.5px solid #22C55E",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: "#16A34A",
                            color: "#FFFFFF",
                            fontWeight: 800,
                            fontSize: "1.1rem",
                          }}
                        >
                          {selectedContact.avatarText}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#0F172A" }}>
                            {selectedContact.name}
                          </Typography>
                          <Typography sx={{ fontSize: "0.8rem", color: "#16A34A", fontWeight: 700 }}>
                            ✓ Destinatario verificado
                          </Typography>
                        </Box>
                      </Box>

                      {/* Botón para deseleccionar */}
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
                        Deseleccionar
                      </Button>
                    </Box>

                    {/* Información Bancaria Completa */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1,
                        bgcolor: "#FFFFFF",
                        p: 1.5,
                        borderRadius: "12px",
                        border: "1px solid #DCFCE7",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>EMAIL</Typography>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", wordBreak: "break-all" }}>
                          {selectedContact.email}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>Nº CUENTA</Typography>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A" }}>
                          Cuenta #{selectedContact.accountId}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>ALIAS</Typography>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0056D2" }}>
                          {selectedContact.alias}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600 }}>CVU</Typography>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A" }}>
                          {selectedContact.cvu}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ) : (
                  <>
                    {/* Campo de búsqueda manual */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Email, CVU, Alias o Nº de Cuenta"
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
                      placeholder="Ej. 2, Roberto Carlos, Alias"
                    />

                    {/* Grilla compacta de contactos sugeridos (2 columnas) */}
                    <Box sx={{ mt: 2, mb: 1 }}>
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
                          mb: 1,
                        }}
                      >
                        <HistoryOutlinedIcon sx={{ fontSize: "1rem", color: "#0056D2" }} />
                        Destinatarios sugeridos
                      </Typography>

                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                        {contactList.map((contact) => (
                          <CardActionArea
                            key={contact.id}
                            onClick={() => handleSelectContact(contact)}
                            sx={{
                              p: 1.2,
                              borderRadius: "12px",
                              bgcolor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              transition: "all 0.15s ease",
                              "&:hover": { bgcolor: "#EFF6FF", borderColor: "#93C5FD" },
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 34,
                                  height: 34,
                                  bgcolor: "#0056D2",
                                  color: "#FFFFFF",
                                  fontWeight: 700,
                                  fontSize: "0.85rem",
                                }}
                              >
                                {contact.avatarText}
                              </Avatar>
                              <Box sx={{ textAlign: "left", minWidth: 0, flex: 1 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
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
                                    fontSize: "0.72rem",
                                    color: "#64748B",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  Cuenta #{contact.accountId} · {contact.alias}
                                </Typography>
                              </Box>
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
                {/* Destinatario resumen compacto */}
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
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E3A8A" }}>
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

            {/* ─── PASO 3: RESUMEN Y CONFIRMACIÓN CON INFORMACIÓN COMPLETA ─── */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit">
                <Typography sx={{ color: "#0F172A", fontSize: "1rem", fontWeight: 700, mb: 2 }}>
                  Confirmá los datos de la transferencia
                </Typography>

                {/* Ficha Completa del Destinatario */}
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
                    gap: 0.8,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>Destinatario</Typography>
                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>
                      {destinationDisplay}
                    </Typography>
                  </Box>

                  {activeContact && (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>Email</Typography>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>
                          {activeContact.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>Cuenta / CVU</Typography>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>
                          Cuenta #{activeContact.accountId} · {activeContact.cvu}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>Alias / Banco</Typography>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0056D2" }}>
                          {activeContact.alias} · {activeContact.bank}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Divider sx={{ my: 0.5 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>Motivo</Typography>
                    <Chip label={motive} size="small" sx={{ fontWeight: 700, bgcolor: "#EFF6FF", color: "#0056D2" }} />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>Comisión</Typography>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#10B981" }}>
                      Gratis ($ 0,00)
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5, pt: 1, borderTop: "1px dashed #CBD5E1" }}>
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

            {/* ─── PASO 4: ÉXITO ─── */}
            {step === 4 && (
              <SuccessStep
                title="¡Transferencia exitosa!"
                subtitle={`Enviamos el dinero a ${destinationDisplay}.`}
                amount={Number(amount)}
                details={[
                  { label: "Destinatario", value: destinationDisplay },
                  { label: "Cuenta", value: activeContact ? `Cuenta #${activeContact.accountId}` : destinationInput },
                  { label: "Motivo", value: motive },
                  { label: "Nuevo saldo disponible", value: formatCurrency(account.money) },
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
