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
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { motion, AnimatePresence } from "framer-motion";

import { useAccount } from "../../hooks/useAccount";
import AppLayout from "../../components/layout/AppLayout";
import SuccessStep from "../../components/common/SuccessStep";
import { formatCurrency } from "../../utils/formatters";

const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const DEFAULT_CONTACTS = [
  {
    id: "seed-2",
    name: "Roberto Carlos",
    destination: "2",
    detail: "Cuenta #2 · robercarlos3@gmail.com",
    avatarText: "R",
  },
  {
    id: "seed-3",
    name: "Mohammed Khan",
    destination: "3",
    detail: "Cuenta #3 · mokha@gmail.com",
    avatarText: "M",
  },
  {
    id: "seed-5",
    name: "Micaela Mulato",
    destination: "5",
    detail: "Cuenta #5 · micaela.mulato@digitalars.com",
    avatarText: "M",
  },
  {
    id: "seed-6",
    name: "Emmanuel Torres",
    destination: "6",
    detail: "Cuenta #6 · emmanuel.torres@digitalars.com",
    avatarText: "E",
  },
];

/**
 * HU-26: Pantalla de transferencia de fondos.
 */
export function TransferPage() {
  const navigate = useNavigate();
  const { account, transferFunds, transactions } = useAccount();

  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [recentRecipients, setRecentRecipients] = useState(DEFAULT_CONTACTS);

  const currentBalance = account?.money ?? 0;

  // Carga y filtra destinatarios de transferencias (excluyendo compras/suscripciones)
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

    const extracted = [];
    const seen = new Set();

    outgoing.forEach((t) => {
      let destId = t.toAccountId ? String(t.toAccountId) : "";
      let name = t.title || "Transferencia";

      if (name.toLowerCase().startsWith("transferencia a ")) {
        name = name.substring("transferencia a ".length).trim();
      } else if (name.toLowerCase().startsWith("transferencia enviada a ")) {
        name = name.substring("transferencia enviada a ".length).trim();
      }

      if (destId && !seen.has(destId)) {
        seen.add(destId);
        extracted.push({
          id: `tx-${t.id}`,
          name: name,
          destination: destId,
          detail: t.subtitle || `Cuenta #${destId}`,
          avatarText: (name || destId).charAt(0).toUpperCase(),
        });
      }
    });

    DEFAULT_CONTACTS.forEach((c) => {
      if (!seen.has(c.destination)) {
        seen.add(c.destination);
        extracted.push(c);
      }
    });

    setRecentRecipients(extracted);
  }, [transactions]);

  const filteredRecipients = recentRecipients.filter((rec) => {
    if (!destination.trim()) return true;
    const q = destination.toLowerCase().trim();
    return (
      rec.name.toLowerCase().includes(q) ||
      rec.destination.toLowerCase().includes(q) ||
      rec.detail.toLowerCase().includes(q)
    );
  });

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  const handleTransfer = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return;

    setLoading(true);
    try {
      await transferFunds({
        destination,
        amount: num,
        concept: concept || `Transferencia a ${destination}`,
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
    <AppLayout onBack={step < 4 ? handleBack : null} maxWidth={650}>
      <Box sx={{ maxWidth: 500, mx: "auto", width: "100%", pb: { xs: 8, md: 4 } }}>
        {step < 4 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A", mb: 0.5, fontSize: { xs: "1.75rem", md: "2rem" } }}>
              Transferir dinero
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>
              Enviá fondos a otras cuentas de forma rápida y segura.
            </Typography>
          </Box>
        )}

        <Card
          elevation={0}
          sx={{
            borderRadius: "24px",
            p: { xs: 3, md: 4 },
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.08)",
            minHeight: 360,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AnimatePresence mode="wait">
            {/* PASO 1: Destinatario */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "#0F172A", fontSize: "1.1rem", fontWeight: 700, mb: 3 }}>
                  ¿A quién le vas a transferir?
                </Typography>

                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Email, CVU, Alias o Nº de Cuenta"
                    variant="outlined"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineOutlinedIcon sx={{ color: "#94A3B8" }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: "16px", bgcolor: "#F8FAFC" }
                    }}
                    placeholder="Ej. 2, Roberto Carlos, Alias"
                  />

                  <Box sx={{ mt: 3, mb: 1 }}>
                    <Typography
                      sx={{
                        color: "#64748B",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        mb: 1.5,
                      }}
                    >
                      <HistoryOutlinedIcon sx={{ fontSize: "1.1rem", color: "#0056D2" }} />
                      Últimos destinatarios
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, maxHeight: 250, overflowY: "auto", pr: 0.5 }}>
                      {filteredRecipients.map((rec) => {
                        const isSelected = destination === rec.destination;
                        return (
                          <CardActionArea
                            key={rec.id}
                            onClick={() => setDestination(rec.destination)}
                            sx={{
                              p: 1.5,
                              borderRadius: "16px",
                              bgcolor: isSelected ? "#EEF4FF" : "#F8FAFC",
                              border: isSelected ? "2px solid #0056D2" : "1px solid #E2E8F0",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: isSelected ? "#0056D2" : "#E2E8F0",
                                    color: isSelected ? "#FFFFFF" : "#334155",
                                    fontWeight: 700,
                                  }}
                                >
                                  {rec.avatarText}
                                </Avatar>
                                <Box sx={{ textAlign: "left" }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#0F172A", lineHeight: 1.2 }}>
                                    {rec.name}
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.78rem", color: "#64748B", mt: 0.25 }}>
                                    {rec.detail}
                                  </Typography>
                                </Box>
                              </Box>

                              <Chip
                                label={isSelected ? "Seleccionado" : "Elegir"}
                                size="small"
                                sx={{
                                  bgcolor: isSelected ? "#0056D2" : "#FFFFFF",
                                  color: isSelected ? "#FFFFFF" : "#0056D2",
                                  fontWeight: 700,
                                  border: isSelected ? "none" : "1px solid #BFDBFE",
                                }}
                              />
                            </Box>
                          </CardActionArea>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setStep(2)}
                  disabled={!destination.trim()}
                  sx={{
                    bgcolor: "#0056D2",
                    color: "#FFF",
                    borderRadius: "14px",
                    py: 1.8,
                    fontSize: "1rem",
                    fontWeight: 700,
                    mt: 3,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0047b3" },
                  }}
                >
                  Continuar
                </Button>
              </motion.div>
            )}

            {/* PASO 2: Monto y Concepto */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "#0F172A", fontSize: "1.1rem", fontWeight: 700, mb: 0.5 }}>
                  ¿Cuánto querés transferir?
                </Typography>
                <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 3 }}>
                  Destino: <strong>{destination}</strong>
                </Typography>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ mb: 3, p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#64748B", mb: 0.5 }}>Saldo disponible</Typography>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A" }}>
                      {formatCurrency(currentBalance)}
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Monto a transferir"
                    variant="outlined"
                    value={amount ? `$ ${Number(amount).toLocaleString("es-AR")}` : ""}
                    onChange={handleAmountChange}
                    inputProps={{ inputMode: "numeric" }}
                    InputProps={{
                      sx: { borderRadius: "16px", fontSize: "1.5rem", fontWeight: 700, color: "#0F172A" }
                    }}
                    sx={{ mb: 3 }}
                  />

                  <TextField
                    fullWidth
                    label="Motivo (Opcional)"
                    variant="outlined"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Ej. Alquiler, Servicios, Honorarios"
                    InputProps={{
                      sx: { borderRadius: "12px", bgcolor: "#F8FAFC" }
                    }}
                  />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setStep(3)}
                  disabled={!amount || Number(amount) <= 0 || Number(amount) > currentBalance}
                  sx={{
                    bgcolor: "#0056D2",
                    color: "#FFF",
                    borderRadius: "14px",
                    py: 1.8,
                    fontSize: "1rem",
                    fontWeight: 700,
                    mt: 3,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0047b3" },
                  }}
                >
                  Continuar
                </Button>
              </motion.div>
            )}

            {/* PASO 3: Resumen y Confirmación */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "#0F172A", fontSize: "1.1rem", fontWeight: 700, mb: 3 }}>
                  Revisá los datos antes de confirmar
                </Typography>

                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#64748B" }}>Destinatario</Typography>
                    <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>{destination}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#64748B" }}>Motivo</Typography>
                    <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>{concept || "Varios"}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#64748B" }}>Comisión</Typography>
                    <Typography sx={{ fontWeight: 600, color: "#10B981" }}>Gratis ($ 0,00)</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", mt: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Total a debitar</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#0F172A" }}>
                      {formatCurrency(Number(amount))}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleTransfer}
                  disabled={loading}
                  sx={{
                    bgcolor: "#0056D2",
                    color: "#FFF",
                    borderRadius: "14px",
                    py: 1.8,
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    mt: 3,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0047b3" },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Transferir"}
                </Button>
              </motion.div>
            )}

            {/* PASO 4: Éxito Reutilizable */}
            {step === 4 && (
              <SuccessStep
                title="¡Transferencia exitosa!"
                subtitle={`Enviamos los fondos a ${destination}.`}
                amount={Number(amount)}
                details={[
                  { label: "Destinatario", value: destination },
                  { label: "Concepto", value: concept || "Varios" },
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
