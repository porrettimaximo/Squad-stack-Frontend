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
  useMediaQuery,
  useTheme,
  InputAdornment,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { motion, AnimatePresence } from "framer-motion";

import { useAccount } from "../../hooks/useAccount";
import accountService from "../../services/accountService";
import Sidebar from "../../components/layout/Sidebar";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import MobileBottomNav from "../../components/layout/MobileBottomNav";

export function DepositPage() {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  const { account, updateBalance } = useAccount();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(""); // "transfer" | "card"
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const currentBalance = account?.money ?? 0;
  const quickAmounts = [5000, 10000, 20000];

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  const handleQuickAmount = (val) => {
    setAmount(val.toString());
  };

  const selectMethodAndContinue = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(2);
  };

  const handleContinueToSummary = () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      setSnackbar({ open: true, message: "Ingresá un monto mayor a 0", severity: "warning" });
      return;
    }
    setStep(3);
  };

  const handleDeposit = async () => {
    setLoading(true);
    const num = Number(amount);
    try {
      const response = await accountService.deposit(num);
      const newBalance = response?.newBalance !== undefined ? response.newBalance : (currentBalance + num);

      updateBalance(newBalance);
      setStep(4); // Mostrar pantalla de éxito

      // Auto-redirigir al inicio luego de 2.5 segundos
      setTimeout(() => navigate("/"), 2500);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Hubo un error al depositar los fondos.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) navigate("/");
    else if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const formatter = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const getMethodName = () => method === "transfer" ? "Transferencia Bancancaria" : "Tarjeta virtual";

  // Animaciones de Framer Motion
  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const renderContent = () => (
    <>
      {/* Botón Volver - Arriba a la izquierda, fuera del contenedor centrado */}
      {step < 4 && (
        <Box sx={{ display: "flex", alignSelf: "flex-start", mb: { xs: 2, md: 3 } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              color: "#3B82F6", // Azul clarito
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.05rem",
              borderRadius: "12px",
              px: 2,
              py: 1,
              "&:hover": {
                bgcolor: "#EFF6FF" // Fondo sutil azul al pasar el mouse
              }
            }}
          >
            Volver
          </Button>
        </Box>
      )}

      <Box sx={{ maxWidth: 500, mx: "auto", width: "100%", pb: { xs: 10, md: 4 } }}>
        {step < 4 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A", mb: 0.5, fontSize: { xs: "1.75rem", md: "2rem" } }}>
              Depositar dinero
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>
              Sumá fondos a tu cuenta de forma rápida y segura.
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
            minHeight: "350px", // Mantiene un tamaño consistente para evitar saltos bruscos
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AnimatePresence mode="wait">

            {/* PASO 1: Elegir método */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "#0F172A", fontSize: "1.1rem", fontWeight: 700, mb: 3 }}>
                  Elegí una cuenta
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    onClick={() => selectMethodAndContinue("transfer")}
                    sx={{
                      display: "flex", alignItems: "center", p: 2.5, borderRadius: "16px",
                      border: "1px solid #E2E8F0", cursor: "pointer", transition: "all 0.2s",
                      "&:hover": { borderColor: "#0056D2", bgcolor: "#F0F6FF" }
                    }}
                  >
                    <AccountBalanceIcon sx={{ color: "#0056D2", mr: 2, fontSize: "1.8rem" }} />
                    <Typography sx={{ fontWeight: 600, color: "#0F172A", flex: 1, fontSize: "1.05rem" }}>
                      Transferencia bancaria
                    </Typography>
                    <ArrowBackIcon sx={{ color: "#CBD5E1", transform: "rotate(180deg)" }} />
                  </Box>

                  <Box
                    onClick={() => selectMethodAndContinue("card")}
                    sx={{
                      display: "flex", alignItems: "center", p: 2.5, borderRadius: "16px",
                      border: "1px solid #E2E8F0", cursor: "pointer", transition: "all 0.2s",
                      "&:hover": { borderColor: "#0056D2", bgcolor: "#F0F6FF" }
                    }}
                  >
                    <CreditCardIcon sx={{ color: "#0056D2", mr: 2, fontSize: "1.8rem" }} />
                    <Typography sx={{ fontWeight: 600, color: "#0F172A", flex: 1, fontSize: "1.05rem" }}>
                      Tarjeta
                    </Typography>
                    <ArrowBackIcon sx={{ color: "#CBD5E1", transform: "rotate(180deg)" }} />
                  </Box>
                </Box>
              </motion.div>
            )}

            {/* PASO 2: Ingresar Monto */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography sx={{ color: "#0F172A", fontSize: "1.1rem", fontWeight: 700 }}>
                    ¿Cuánto querés depositar?
                  </Typography>
                  <Chip
                    label={getMethodName()}
                    size="small"
                    sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 500 }}
                  />
                </Box>

                <Typography sx={{ color: "#64748B", fontSize: "0.95rem", mb: 2 }}>
                  Saldo actual: <Typography component="span" sx={{ fontWeight: 700, color: "#0F172A" }}>${formatter.format(currentBalance)}</Typography>
                </Typography>

                <TextField
                  fullWidth
                  autoFocus
                  value={amount ? `$ ${Number(amount).toLocaleString("es-AR")}` : ""}
                  onChange={handleAmountChange}
                  placeholder="$ 0"
                  variant="outlined"
                  InputProps={{
                    sx: {
                      fontSize: "1.5rem", fontWeight: 700, color: "#0F172A", borderRadius: "16px",
                      bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" },
                      "&.Mui-focused fieldset": { borderColor: "#0056D2", borderWidth: "2px" }
                    }
                  }}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: "flex", gap: 1.5, mb: 4, flexWrap: "wrap" }}>
                  {quickAmounts.map((q) => (
                    <Chip
                      key={q}
                      label={`+$${formatter.format(q).split(',')[0]}`}
                      onClick={() => handleQuickAmount(q)}
                      sx={{
                        bgcolor: amount === q.toString() ? "#0056D2" : "#EEF4FF",
                        color: amount === q.toString() ? "#FFFFFF" : "#0056D2",
                        fontWeight: 700, fontSize: "0.95rem", borderRadius: "10px", py: 2.5, px: 1,
                        "&:hover": { bgcolor: amount === q.toString() ? "#004FA8" : "#DDE8FF" }
                      }}
                    />
                  ))}
                </Box>

                <Box sx={{ mt: "auto" }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleContinueToSummary}
                    disabled={!amount || Number(amount) <= 0}
                    sx={{
                      py: 1.8, borderRadius: "16px", bgcolor: "#0056D2", fontSize: "1.1rem", fontWeight: 700, textTransform: "none",
                      "&:hover": { bgcolor: "#0044A8" }, "&:disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" }
                    }}
                  >
                    Continuar
                  </Button>
                </Box>
              </motion.div>
            )}

            {/* PASO 3: Resumen y Confirmación */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "#0F172A", fontSize: "1.1rem", fontWeight: 700, mb: 3 }}>
                  Revisá los datos
                </Typography>

                <Box sx={{ bgcolor: "#F8FAFC", p: 2.5, borderRadius: "16px", mb: 4, border: "1px solid #E2E8F0" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography sx={{ color: "#64748B", fontWeight: 500 }}>Método:</Typography>
                    <Typography sx={{ color: "#0F172A", fontWeight: 700 }}>{getMethodName()}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography sx={{ color: "#64748B", fontWeight: 500 }}>Cuenta destino:</Typography>
                    <Typography sx={{ color: "#0F172A", fontWeight: 700 }}>CVU 00000031...459</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography sx={{ color: "#64748B", fontWeight: 500 }}>Se acredita:</Typography>
                    <Typography sx={{ color: "#0F172A", fontWeight: 700 }}>Inmediatamente</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#64748B", fontWeight: 500 }}>Comisión:</Typography>
                    <Typography sx={{ color: "#047857", fontWeight: 700 }}>$0</Typography>
                  </Box>
                  <Divider sx={{ my: 1.5, borderColor: "#E2E8F0" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#0F172A", fontWeight: 600 }}>Total a acreditar:</Typography>
                    <Typography sx={{ color: "#0F172A", fontWeight: 800, fontSize: "1.25rem" }}>
                      ${amount ? formatter.format(Number(amount)).split(',')[0] : "0"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: "auto" }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleDeposit}
                    disabled={loading}
                    sx={{
                      py: 1.8, borderRadius: "16px", bgcolor: "#076B38", fontSize: "1.1rem", fontWeight: 700, textTransform: "none",
                      boxShadow: "0 4px 14px rgba(7, 107, 56, 0.25)",
                      "&:hover": { bgcolor: "#05522B", boxShadow: "0 6px 20px rgba(7, 107, 56, 0.35)" },
                      "&:disabled": { bgcolor: "#CBD5E1" }
                    }}
                  >
                    {loading ? <CircularProgress size={26} color="inherit" /> : "Depositar"}
                  </Button>

                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 2.5, gap: 1, opacity: 0.8 }}>
                    <SecurityIcon sx={{ fontSize: "1.1rem", color: "#64748B" }} />
                    <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 500 }}>
                      Tu dinero está protegido
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            )}

            {/* PASO 4: Éxito */}
            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircleIcon sx={{ fontSize: "6rem", color: "#047857", mb: 2 }} />
                </motion.div>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", mb: 1 }}>
                  ¡Dinero depositado!
                </Typography>
                <Typography sx={{ color: "#64748B", textAlign: "center", mb: 4 }}>
                  Tu saldo ya fue actualizado. Redirigiendo al inicio...
                </Typography>
                <CircularProgress size={24} sx={{ color: "#0056D2" }} />
              </motion.div>
            )}

          </AnimatePresence>
        </Card>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      {isDesktop && <Sidebar activeItem="inicio" onItemClick={() => navigate("/")} />}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {isDesktop && <DashboardNavbar />}
        <Box component="main" sx={{ flex: 1, overflowY: "auto", p: { xs: 2.5, md: 5 } }}>
          {renderContent()}
        </Box>
        {!isDesktop && <MobileBottomNav activeItem="inicio" onChange={() => navigate("/")} />}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: { xs: 8, md: 2 } }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DepositPage;
