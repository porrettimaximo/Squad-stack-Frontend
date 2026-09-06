import React, { useState } from "react";
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
  Chip,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SecurityIcon from "@mui/icons-material/Security";
import { motion, AnimatePresence } from "framer-motion";

import { useAccount } from "../../hooks/useAccount";
import AppLayout from "../../components/layout/AppLayout";
import SuccessStep from "../../components/common/SuccessStep";
import { formatCurrency } from "../../utils/formatters";
import { DEPOSIT_MOTIVES, DEFAULT_DEPOSIT_MOTIVE } from "../../constants/motives";

const QUICK_AMOUNTS = [5000, 10000, 20000];

const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

/**
 * HU-25: Pantalla de depósito de fondos.
 */
export function DepositPage() {
  const navigate = useNavigate();
  const { account, depositFunds } = useAccount();

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [motive, setMotive] = useState(DEFAULT_DEPOSIT_MOTIVE);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const currentBalance = account?.money ?? 0;

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  const handleDeposit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return;

    setLoading(true);
    try {
      await depositFunds({ amount: num, concept: motive });
      setStep(4);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Error al depositar", severity: "error" });
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
              Ingresar dinero
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>
              Elegí cómo querés cargar fondos en tu cuenta DigitalArs.
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
            {/* PASO 1: Selección de Método */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "#0F172A", fontSize: "1.1rem", fontWeight: 700, mb: 2 }}>
                  Seleccioná el medio de ingreso
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => { setMethod("transfer"); setStep(2); }}
                    sx={{
                      p: 2.5,
                      borderRadius: "16px",
                      justifyContent: "flex-start",
                      textAlign: "left",
                      borderColor: "#E2E8F0",
                      bgcolor: "#F8FAFC",
                      "&:hover": { borderColor: "#0056D2", bgcolor: "#EFF6FF" },
                    }}
                  >
                    <AccountBalanceIcon sx={{ fontSize: 36, color: "#0056D2", mr: 2 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>
                        Transferencia Bancaria (CVU / CBU)
                      </Typography>
                      <Typography sx={{ color: "#64748B", fontSize: "0.85rem", textTransform: "none" }}>
                        Acreditación instantánea sin comisión
                      </Typography>
                    </Box>
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => { setMethod("card"); setStep(2); }}
                    sx={{
                      p: 2.5,
                      borderRadius: "16px",
                      justifyContent: "flex-start",
                      textAlign: "left",
                      borderColor: "#E2E8F0",
                      bgcolor: "#F8FAFC",
                      "&:hover": { borderColor: "#0056D2", bgcolor: "#EFF6FF" },
                    }}
                  >
                    <CreditCardIcon sx={{ fontSize: 36, color: "#0056D2", mr: 2 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>
                        Tarjeta de Débito
                      </Typography>
                      <Typography sx={{ color: "#64748B", fontSize: "0.85rem", textTransform: "none" }}>
                        Ingreso directo desde tus tarjetas vinculadas
                      </Typography>
                    </Box>
                  </Button>
                </Box>
              </motion.div>
            )}

            {/* PASO 2: Ingresar Monto */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "#0F172A", fontSize: "1.1rem", fontWeight: 700, mb: 1 }}>
                  ¿Cuánto querés ingresar?
                </Typography>

                <Box sx={{ mb: 3, p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>Saldo actual en cuenta</Typography>
                  <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A" }}>
                    {formatCurrency(currentBalance)}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  variant="outlined"
                  value={amount ? `$ ${Number(amount).toLocaleString("es-AR")}` : ""}
                  onChange={handleAmountChange}
                  placeholder="$ 0,00"
                  inputProps={{ inputMode: "numeric" }}
                  InputProps={{
                    sx: { borderRadius: "16px", fontSize: "1.6rem", fontWeight: 800, color: "#0F172A" }
                  }}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                  {QUICK_AMOUNTS.map((val) => (
                    <Chip
                      key={val}
                      label={`+$${val.toLocaleString("es-AR")}`}
                      onClick={() => setAmount(val.toString())}
                      clickable
                      sx={{
                        fontWeight: 700,
                        bgcolor: "#EFF6FF",
                        color: "#0056D2",
                        border: "1px solid #BFDBFE",
                      }}
                    />
                  ))}
                </Box>

                {/* Selector de Motivo del Depósito */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", mb: 0.8 }}>
                    Motivo del ingreso
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={motive}
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
                      {DEPOSIT_MOTIVES.map((m) => (
                        <MenuItem key={m.id} value={m.label} sx={{ fontSize: "0.88rem", py: 1 }}>
                          {m.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }} />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setStep(3)}
                  disabled={!amount || Number(amount) <= 0}
                  sx={{
                    bgcolor: "#0056D2",
                    py: 1.8,
                    borderRadius: "14px",
                    fontWeight: 700,
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
                  Confirmá el ingreso de fondos
                </Typography>

                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#64748B" }}>Medio de pago</Typography>
                    <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>
                      {method === "transfer" ? "Transferencia Bancaria" : "Tarjeta de Débito"}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#64748B" }}>Motivo</Typography>
                    <Chip label={motive} size="small" sx={{ fontWeight: 700, bgcolor: "#EFF6FF", color: "#0056D2" }} />
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#64748B" }}>Monto</Typography>
                    <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>
                      {formatCurrency(Number(amount))}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#64748B" }}>Comisión</Typography>
                    <Typography sx={{ fontWeight: 600, color: "#10B981" }}>Gratis ($ 0,00)</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", mt: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>Nuevo saldo estimado</Typography>
                    <Typography sx={{ fontWeight: 800, color: "#0056D2", fontSize: "1.15rem" }}>
                      {formatCurrency(currentBalance + Number(amount))}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleDeposit}
                  disabled={loading}
                  sx={{
                    bgcolor: "#0056D2",
                    py: 1.8,
                    borderRadius: "14px",
                    fontWeight: 700,
                    textTransform: "none",
                    mt: 3,
                    "&:hover": { bgcolor: "#0047b3" },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar Depósito"}
                </Button>
              </motion.div>
            )}

            {/* PASO 4: Éxito Reutilizable */}
            {step === 4 && (
              <SuccessStep
                title="¡Depósito exitoso!"
                subtitle="Los fondos fueron acreditados en tu cuenta DigitalArs."
                amount={Number(amount)}
                details={[
                  { label: "Motivo", value: motive },
                  { label: "Nuevo saldo disponible", value: formatCurrency(account.money) },
                  { label: "Medio utilizado", value: method === "transfer" ? "Transferencia Inmediata" : "Tarjeta de Débito" },
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

export default DepositPage;
