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
import { formatCurrency, parseAmount, sanitizeNumericInput } from "../../utils/formatters";
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
  const numAmount = parseAmount(amount);

  const handleAmountChange = (e) => {
    setAmount(sanitizeNumericInput(e.target.value));
  };

  const handleDeposit = async () => {
    const num = parseAmount(amount);
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
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5, fontSize: { xs: "1.75rem", md: "2rem" } }}>
              Ingresar dinero
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.95rem" }}>
              Elegí cómo querés cargar fondos en tu cuenta DigitalArs.
            </Typography>
          </Box>
        )}

        <Card
          elevation={0}
          sx={{
            borderRadius: "24px",
            p: { xs: 3, md: 4 },
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
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
                <Typography sx={{ color: "text.primary", fontSize: "1.1rem", fontWeight: 700, mb: 2 }}>
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
                      borderColor: "divider",
                      bgcolor: "action.hover",
                      "&:hover": { borderColor: "primary.main", bgcolor: "action.selected" },
                    }}
                  >
                    <AccountBalanceIcon sx={{ fontSize: 36, color: "primary.main", mr: 2 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem" }}>
                        Transferencia Bancaria (CVU / CBU)
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", textTransform: "none" }}>
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
                      borderColor: "divider",
                      bgcolor: "action.hover",
                      "&:hover": { borderColor: "primary.main", bgcolor: "action.selected" },
                    }}
                  >
                    <CreditCardIcon sx={{ fontSize: 36, color: "primary.main", mr: 2 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem" }}>
                        Tarjeta de Débito
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", textTransform: "none" }}>
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
                <Typography sx={{ color: "text.primary", fontSize: "1.1rem", fontWeight: 700, mb: 1 }}>
                  ¿Cuánto querés ingresar?
                </Typography>

                <Box sx={{ mb: 3, p: 2, bgcolor: "action.hover", borderRadius: "12px", border: "1px solid", borderColor: "divider" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Saldo actual en cuenta</Typography>
                  <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "text.primary" }}>
                    {formatCurrency(currentBalance)}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  variant="outlined"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  slotProps={{
                    htmlInput: { inputMode: "decimal" },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, color: "primary.main", mr: 0.5 }}>
                            $
                          </Typography>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: "16px", fontSize: "1.6rem", fontWeight: 800, color: "text.primary" },
                    },
                  }}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                  {QUICK_AMOUNTS.map((val) => (
                    <Chip
                      key={val}
                      label={`+$${val.toLocaleString("es-AR")}`}
                      onClick={() => setAmount(val.toString())}
                      clickable
                      sx={{
                        fontWeight: 700,
                        bgcolor: numAmount === val ? "primary.main" : "action.hover",
                        color: numAmount === val ? "#FFFFFF" : "text.primary",
                        border: "1px solid",
                        borderColor: numAmount === val ? "primary.main" : "divider",
                        "&:hover": { bgcolor: numAmount === val ? "primary.dark" : "action.selected" },
                      }}
                    />
                  ))}
                </Box>

                {/* Selector de Motivo del Depósito */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "text.secondary", mb: 0.8 }}>
                    Motivo del ingreso
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={motive}
                      onChange={(e) => setMotive(e.target.value)}
                      sx={{ borderRadius: "12px", bgcolor: "action.hover", fontSize: "0.9rem" }}
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
                  disabled={!amount || numAmount <= 0}
                  sx={{
                    bgcolor: "primary.main",
                    py: 1.8,
                    borderRadius: "14px",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  Continuar
                </Button>
              </motion.div>
            )}

            {/* PASO 3: Resumen y Confirmación */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "text.primary", fontSize: "1.1rem", fontWeight: 700, mb: 3 }}>
                  Confirmá el ingreso de fondos
                </Typography>

                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "text.secondary" }}>Medio de pago</Typography>
                    <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                      {method === "transfer" ? "Transferencia Bancaria" : "Tarjeta de Débito"}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "text.secondary" }}>Motivo</Typography>
                    <Chip
                      label={motive}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.2)" : "#EFF6FF"),
                        color: (theme) => (theme.palette.mode === "dark" ? "#93C5FD" : "#0056D2"),
                        border: "1px solid",
                        borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.35)" : "#BFDBFE"),
                      }}
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "text.secondary" }}>Monto</Typography>
                    <Typography sx={{ fontWeight: 700, color: "text.primary" }}>
                      {formatCurrency(numAmount)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", p: 2, bgcolor: "action.hover", borderRadius: "12px", mt: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: "text.primary" }}>Nuevo saldo estimado</Typography>
                    <Typography sx={{ fontWeight: 800, color: (theme) => (theme.palette.mode === "dark" ? "#60A5FA" : "#0056D2"), fontSize: "1.15rem" }}>
                      {formatCurrency(currentBalance + numAmount)}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleDeposit}
                  disabled={loading}
                  sx={{
                    bgcolor: "primary.main",
                    py: 1.8,
                    borderRadius: "14px",
                    fontWeight: 700,
                    textTransform: "none",
                    mt: 3,
                    "&:hover": { bgcolor: "primary.dark" },
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
                amount={numAmount}
                details={[
                  { label: "Medio de ingreso", value: method === "transfer" ? "Transferencia" : "Tarjeta Débito" },
                  { label: "Motivo", value: motive },
                  { label: "Nuevo saldo disponible", value: formatCurrency(account?.money ?? 0) },
                ]}
                finishLabel="Volver al inicio"
                onFinish={() => navigate("/")}
              />
            )}
          </AnimatePresence>
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
