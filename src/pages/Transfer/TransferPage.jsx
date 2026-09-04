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
  useMediaQuery,
  useTheme,
  InputAdornment,
  Divider,
  CircularProgress,
  Avatar,
  Chip,
  CardActionArea,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { motion, AnimatePresence } from "framer-motion";

import { useAccount } from "../../hooks/useAccount";
import transactionService from "../../services/transactionService";
import Sidebar from "../../components/layout/Sidebar";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import MobileBottomNav from "../../components/layout/MobileBottomNav";

export default function TransferPage() {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  const { account, updateBalance } = useAccount();
  const [step, setStep] = useState(1);
  
  // Form state
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Lista de últimos destinatarios de transferencias
  const [recentRecipients, setRecentRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  useEffect(() => {
    async function loadRecipients() {
      setLoadingRecipients(true);
      try {
        const txs = await transactionService.getRecentTransactions(15);
        const outgoing = (txs || []).filter((t) => t.type === 3 || t.category === "EGRESO");

        const extracted = [];
        const seen = new Set();

        outgoing.forEach((t) => {
          let destId = "";
          let name = t.title || "Transferencia";
          
          if (t.toAccountId) {
            destId = String(t.toAccountId);
          } else if (t.title && t.title.includes("#")) {
            destId = t.title.split("#")[1]?.trim();
          } else {
            destId = t.title;
          }

          if (destId && !seen.has(destId)) {
            seen.add(destId);
            extracted.push({
              id: `tx-${t.id}`,
              name: name,
              destination: destId,
              detail: t.subtitle || "Transferencia reciente",
              avatarText: (name || destId).charAt(0).toUpperCase(),
            });
          }
        });

        // Contactos sugeridos del seed de la plataforma
        const defaultContacts = [
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
        ];

        defaultContacts.forEach((c) => {
          if (!seen.has(c.destination)) {
            seen.add(c.destination);
            extracted.push(c);
          }
        });

        setRecentRecipients(extracted);
      } catch (err) {
        console.warn("Error cargando contactos recientes:", err);
      } finally {
        setLoadingRecipients(false);
      }
    }

    loadRecipients();
  }, []);

  const filteredRecipients = recentRecipients.filter((rec) => {
    if (!destination.trim()) return true;
    const q = destination.toLowerCase().trim();
    return (
      rec.name.toLowerCase().includes(q) ||
      rec.destination.toLowerCase().includes(q) ||
      rec.detail.toLowerCase().includes(q)
    );
  });

  const currentBalance = account?.money ?? 0;

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  };

  const handleDestinationSubmit = () => {
    if (!destination.trim()) {
      setSnackbar({ open: true, message: "Ingresá un destinatario (CVU, Alias o Email)", severity: "warning" });
      return;
    }
    setStep(2);
  };

  const handleAmountSubmit = () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      setSnackbar({ open: true, message: "Ingresá un monto mayor a 0", severity: "warning" });
      return;
    }
    if (num > currentBalance) {
      setSnackbar({ open: true, message: "El monto supera tu saldo disponible", severity: "error" });
      return;
    }
    setStep(3);
  };

  const handleTransfer = async () => {
    setLoading(true);
    const num = Number(amount);
    try {
      await transactionService.transfer({
        destination,
        amount: num,
        concept,
      });

      // Se debita el saldo y actualizamos el contexto
      const newBalance = currentBalance - num;
      updateBalance(newBalance);
      
      setStep(4); // Mostrar pantalla de éxito

      // Auto-redirigir al inicio luego de 2.5 segundos
      setTimeout(() => navigate("/"), 2500);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Hubo un error al realizar la transferencia.";
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

  // Animaciones de Framer Motion
  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const renderContent = () => (
    <>
      {step < 4 && (
        <Box sx={{ display: "flex", alignSelf: "flex-start", mb: { xs: 2, md: 3 } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              color: "#3B82F6",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.05rem",
              borderRadius: "12px",
              px: 2,
              py: 1,
              "&:hover": { bgcolor: "#EFF6FF" }
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
            minHeight: "350px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AnimatePresence mode="wait">

            {/* PASO 1: Ingresar destinatario */}
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
                      sx: { borderRadius: "16px", bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" } }
                    }}
                    placeholder="Ej. 2, usuario@mail.com o Alias"
                  />

                  {/* Lista de últimas transferencias y contactos */}
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

                    {loadingRecipients ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : filteredRecipients.length === 0 ? (
                      <Typography sx={{ fontSize: "0.85rem", color: "#94A3B8", fontStyle: "italic", py: 1 }}>
                        No se encontraron coincidencias para "{destination}".
                      </Typography>
                    ) : (
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
                                "&:hover": {
                                  bgcolor: "#EFF6FF",
                                  borderColor: "#93C5FD",
                                },
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
                                      fontSize: "0.95rem",
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
                                    fontSize: "0.75rem",
                                    border: isSelected ? "none" : "1px solid #BFDBFE",
                                  }}
                                />
                              </Box>
                            </CardActionArea>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleDestinationSubmit}
                  disabled={!destination.trim()}
                  sx={{
                    bgcolor: "#0056D2", color: "#FFF", borderRadius: "14px", py: 1.8, fontSize: "1rem", fontWeight: 700, mt: 3, textTransform: "none",
                    "&:hover": { bgcolor: "#0047b3" },
                    "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" }
                  }}
                >
                  Continuar
                </Button>
              </motion.div>
            )}

            {/* PASO 2: Ingresar monto y concepto */}
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
                      $ {formatter.format(currentBalance)}
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
                      sx: { borderRadius: "16px", fontSize: "1.5rem", fontWeight: 700, color: "#0F172A", "& fieldset": { borderColor: "#E2E8F0" } }
                    }}
                    sx={{ mb: 3 }}
                  />

                  <TextField
                    fullWidth
                    label="Motivo (Opcional)"
                    variant="outlined"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Ej. Alquiler, Comida"
                    InputProps={{
                      sx: { borderRadius: "12px", bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" } }
                    }}
                  />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAmountSubmit}
                  disabled={!amount || Number(amount) <= 0 || Number(amount) > currentBalance}
                  sx={{
                    bgcolor: "#0056D2", color: "#FFF", borderRadius: "14px", py: 1.8, fontSize: "1rem", fontWeight: 700, mt: 3, textTransform: "none",
                    "&:hover": { bgcolor: "#0047b3" },
                    "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" }
                  }}
                >
                  Continuar
                </Button>
              </motion.div>
            )}

            {/* PASO 3: Resumen y confirmación */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "#0F172A", fontSize: "1.1rem", fontWeight: 700, mb: 3 }}>
                  Revisá los datos antes de confirmar
                </Typography>

                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>A quién envías</Typography>
                    <Typography sx={{ color: "#0F172A", fontWeight: 600 }}>{destination}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "#F1F5F9" }} />
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>Motivo</Typography>
                    <Typography sx={{ color: "#0F172A", fontWeight: 600 }}>{concept || "Varios"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "#F1F5F9" }} />
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>Comisión</Typography>
                    <Typography sx={{ color: "#10B981", fontWeight: 600 }}>Sin comisión</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "#F1F5F9" }} />
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, p: 2, bgcolor: "#F8FAFC", borderRadius: "12px" }}>
                    <Typography sx={{ color: "#0F172A", fontWeight: 700, fontSize: "1.1rem" }}>Total a debitar</Typography>
                    <Typography sx={{ color: "#0F172A", fontWeight: 800, fontSize: "1.25rem" }}>
                      $ {formatter.format(Number(amount))}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleTransfer}
                  disabled={loading}
                  sx={{
                    bgcolor: "#0056D2", color: "#FFF", borderRadius: "14px", py: 1.8, fontSize: "1.05rem", fontWeight: 700, mt: 3, textTransform: "none",
                    "&:hover": { bgcolor: "#0047b3" },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Transferir"}
                </Button>
              </motion.div>
            )}

            {/* PASO 4: Éxito */}
            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: "#10B981", mb: 3 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", mb: 1, textAlign: "center" }}>
                  ¡Transferencia enviada!
                </Typography>
                <Typography sx={{ color: "#64748B", textAlign: "center", mb: 4 }}>
                  Enviamos $ {formatter.format(Number(amount))} a {destination}.
                </Typography>
                <CircularProgress size={24} sx={{ color: "#3B82F6" }} />
                <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem", mt: 2 }}>
                  Volviendo al inicio...
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: { xs: 8, md: 0 } }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%", borderRadius: "12px", fontWeight: 500 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#F8FAFC", overflow: "hidden" }}>
      {isDesktop && <Sidebar activeItem="inicio" />}
      
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {isDesktop && <DashboardNavbar />}
        
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, display: "flex", flexDirection: "column" }}>
          {renderContent()}
        </Box>
        
        {!isDesktop && <MobileBottomNav activeNav={0} onChange={() => {}} />}
      </Box>
    </Box>
  );
}
