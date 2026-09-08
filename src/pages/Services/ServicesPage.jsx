import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  Box,

  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BoltIcon from "@mui/icons-material/Bolt";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import { AccountContext } from "../../context/AccountContext";
import { AppLayout } from "../../components/layout/AppLayout";
import { getServiceProviders, simulateInvoice, payService, getMyServicePayments } from "../../services/servicesService";
import { getReserves } from "../../services/reservesService";
import { ServiceReceiptModal } from "../../components/services/ServiceReceiptModal";
import { downloadServicePaymentReceiptPdf } from "../../utils/pdfGenerator";
import { formatCurrency } from "../../utils/formatters";



const SERVICE_SECTIONS = [
  {
    id: 1,
    title: "Electricidad (Luz)",
    icon: <BoltIcon sx={{ color: "#D97706", fontSize: "1.25rem" }} />,
    bgColor: "#FEF3C7",
  },
  {
    id: 2,
    title: "Agua",
    icon: <WaterDropIcon sx={{ color: "#0284C7", fontSize: "1.25rem" }} />,
    bgColor: "#E0F2FE",
  },
  {
    id: 3,
    title: "Gas Natural",
    icon: <LocalFireDepartmentIcon sx={{ color: "#EA580C", fontSize: "1.25rem" }} />,
    bgColor: "#FFEDD5",
  },
  {
    id: 4,
    title: "Telefonía e Internet",
    icon: <PhoneIphoneIcon sx={{ color: "#7C3AED", fontSize: "1.25rem" }} />,
    bgColor: "#EDE9FE",
  },
  {
    id: 5,
    title: "Impuestos y Tasas",
    icon: <AccountBalanceIcon sx={{ color: "#059669", fontSize: "1.25rem" }} />,
    bgColor: "#D1FAE5",
  },
];

export function ServicesPage() {
  const { user } = useAuth();
  const { account, refreshAccount } = useContext(AccountContext);

  const [tab, setTab] = useState(0); // 0: Pagar, 1: Comprobantes
  const [providers, setProviders] = useState([]);
  const [reserves, setReserves] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };



  // Estado del flujo de pago
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedSource, setSelectedSource] = useState("account"); // "account" o reserveId
  const [consultingInvoice, setConsultingInvoice] = useState(false);
  const [invoiceInfo, setInvoiceInfo] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Historial de comprobantes
  const [myPayments, setMyPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Modal de Comprobante
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [lastPaymentData, setLastPaymentData] = useState(null);

  // Cargar Proveedores y Reservas
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        setLoadingProviders(true);
        const [providersData, reservesData] = await Promise.all([
          getServiceProviders(),
          getReserves().catch(() => []),
        ]);
        if (isMounted) {
          setProviders(providersData);
          setReserves(reservesData);
        }
      } catch (err) {
        console.error("Error al cargar proveedores:", err);
      } finally {
        if (isMounted) setLoadingProviders(false);
      }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  // Cargar Historial de Pagos al cambiar a la pestaña 1
  useEffect(() => {
    if (tab === 1) {
      let isMounted = true;
      const loadPayments = async () => {
        try {
          setLoadingPayments(true);
          const data = await getMyServicePayments();
          if (isMounted) setMyPayments(data);
        } catch (err) {
          console.error("Error al cargar comprobantes:", err);
        } finally {
          if (isMounted) setLoadingPayments(false);
        }
      };
      loadPayments();
      return () => { isMounted = false; };
    }
  }, [tab]);

  const providersByCategory = useMemo(() => {
    const map = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    providers.forEach((p) => {
      if (map[p.category]) {
        map[p.category].push(p);
      } else {
        map[p.category] = [p];
      }
    });
    return map;
  }, [providers]);



  const getCategoryIcon = (category) => {
    switch (category) {
      case 1: return <BoltIcon sx={{ color: "#F59E0B" }} />;
      case 2: return <WaterDropIcon sx={{ color: "#0284C7" }} />;
      case 3: return <LocalFireDepartmentIcon sx={{ color: "#EA580C" }} />;
      case 4: return <PhoneIphoneIcon sx={{ color: "#8B5CF6" }} />;
      case 5: return <AccountBalanceIcon sx={{ color: "#10B981" }} />;
      default: return <ReceiptLongIcon sx={{ color: "text.secondary" }} />;
    }
  };

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    setReferenceNumber("");
    setAmount("");
    setInvoiceInfo(null);
    setPaymentError("");
  };

  const handleConsultInvoice = async () => {
    if (!referenceNumber.trim()) {
      setPaymentError("Por favor ingresá el número de cliente o código de pago.");
      return;
    }
    try {
      setPaymentError("");
      setConsultingInvoice(true);
      const data = await simulateInvoice(selectedProvider.id, referenceNumber.trim());
      setInvoiceInfo(data);
      setAmount(String(data.amount));
    } catch (err) {
      const msg = err.response?.data?.message || "No se pudo consultar la factura.";
      setPaymentError(msg);
    } finally {
      setConsultingInvoice(false);
    }
  };

  const handleExecutePayment = async () => {
    setPaymentError("");
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setPaymentError("El monto a pagar debe ser mayor a $0.");
      return;
    }
    if (!referenceNumber.trim()) {
      setPaymentError("El número de referencia o factura es requerido.");
      return;
    }

    const isUsingReserve = selectedSource !== "account";
    const chosenReserve = isUsingReserve ? reserves.find((r) => String(r.id) === String(selectedSource)) : null;

    if (isUsingReserve) {
      if (!chosenReserve || chosenReserve.currentBalance < parsedAmount) {
        setPaymentError(`Saldo insuficiente en la reserva seleccionada ($${chosenReserve?.currentBalance || 0}).`);
        return;
      }
    } else {
      if (account.money < parsedAmount) {
        setPaymentError(`Saldo insuficiente en tu cuenta corriente ($${account.money}).`);
        return;
      }
    }

    try {
      setSubmittingPayment(true);
      const payload = {
        serviceProviderId: selectedProvider.id,
        referenceNumber: referenceNumber.trim(),
        amount: parsedAmount,
        reserveId: isUsingReserve ? chosenReserve.id : null,
      };

      const result = await payService(payload);

      // Refrescar saldo de la cuenta y reservas
      if (refreshAccount) refreshAccount();
      const updatedReserves = await getReserves().catch(() => []);
      setReserves(updatedReserves);

      setLastPaymentData({
        ...result,
        reserveName: chosenReserve?.name,
      });
      setReceiptModalOpen(true);

      // Limpiar formulario
      setSelectedProvider(null);
      setReferenceNumber("");
      setAmount("");
      setInvoiceInfo(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Ocurrió un error al procesar el pago.";
      setPaymentError(msg);
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <AppLayout activeItem="servicios">
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        {/* Cabecera Principal */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "text.primary", fontSize: { xs: "1.5rem", sm: "1.85rem" } }}>
            Pago de Servicios
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "0.95rem", mt: 0.5 }}>
            Aboná tus facturas de luz, agua, gas, telefonía, internet e impuestos sin comisiones.
          </Typography>
        </Box>

        {/* Pestañas */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: "14px",
            bgcolor: "action.hover",
            p: 0.5,
            border: "1px solid", borderColor: "divider",
            display: "inline-block",
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
                minHeight: 38,
                py: 0.5,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                  bgcolor: "background.paper",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                },
              },
              "& .MuiTabs-indicator": { display: "none" },
            }}
          >
            <Tab label="Pagar un Servicio" />
            <Tab label="Mis Comprobantes" />
          </Tabs>
        </Paper>

        {/* TAB 0: Flujo de Pago */}
        {tab === 0 && (
          <>
            {!selectedProvider ? (
              <Box>
                {/* Tabla de Servicios por Secciones Desplegables */}
                {loadingProviders ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      borderRadius: "16px",
                      border: "1px solid", borderColor: "divider",
                      overflow: "hidden",
                      bgcolor: "background.paper",
                      boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
                    }}
                  >
                    <Table sx={{ minWidth: "100%" }}>
                      <TableBody>
                        {SERVICE_SECTIONS.map((section) => {
                          const items = providersByCategory[section.id] || [];
                          const isExpanded = !!expandedCategories[section.id];

                          return (
                            <React.Fragment key={section.id}>
                              {/* Fila Cabecera de la Sección (Clic para Desplegar) */}
                              <TableRow
                                hover
                                onClick={() => toggleCategory(section.id)}
                                sx={{
                                  cursor: "pointer",
                                  bgcolor: isExpanded ? "action.hover" : "background.paper",
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  transition: "background-color 0.15s ease",
                                }}
                              >
                                <TableCell sx={{ py: 1.8, px: { xs: 2, sm: 3 }, borderBottom: "1px solid", borderColor: "divider" }}>
                                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.2, sm: 2 } }}>
                                      <Box
                                        sx={{
                                          width: 38,
                                          height: 38,
                                          borderRadius: "10px",
                                          bgcolor: section.bgColor,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          flexShrink: 0,
                                        }}
                                      >
                                        {section.icon}
                                      </Box>
                                      <Box>
                                        <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
                                          {section.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                          {items.length} {items.length === 1 ? "empresa disponible" : "empresas disponibles"}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                      <IconButton size="small" sx={{ color: "text.secondary" }}>
                                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                      </IconButton>
                                    </Box>
                                  </Box>
                                </TableCell>
                              </TableRow>


                              {/* Filas de Empresas Desplegadas */}
                              {isExpanded && (
                                items.length === 0 ? (
                                  <TableRow sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                                    <TableCell sx={{ py: 2, px: { xs: 3, sm: 5 }, color: "text.secondary", fontStyle: "italic", borderBottom: "1px solid", borderColor: "divider" }}>
                                      No hay empresas registradas en esta categoría.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  items.map((provider) => (
                                    <TableRow
                                      key={provider.id}
                                      hover
                                      onClick={() => handleSelectProvider(provider)}
                                      sx={{
                                        cursor: "pointer",
                                        bgcolor: "background.paper",
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        "&:hover": {
                                          bgcolor: "action.hover",
                                        },
                                      }}
                                    >
                                      <TableCell sx={{ py: 1.6, px: { xs: 2.5, sm: 4 }, borderBottom: "1px solid", borderColor: "divider" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#0056D2", flexShrink: 0 }} />
                                            <Box>
                                              <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: { xs: "0.92rem", sm: "0.98rem" } }}>
                                                {provider.name}
                                              </Typography>
                                              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.74rem" }}>
                                                {section.title}
                                              </Typography>
                                            </Box>
                                          </Box>

                                          <Button
                                            size="small"
                                            variant="outlined"
                                            endIcon={<ArrowForwardIosIcon sx={{ fontSize: "0.7rem !important" }} />}
                                            sx={{
                                              borderRadius: "8px",
                                              textTransform: "none",
                                              fontWeight: 700,
                                              fontSize: "0.8rem",
                                              py: 0.4,
                                              px: { xs: 1.4, sm: 2 },
                                              color: "#0056D2",
                                              borderColor: "#BFDBFE",
                                              bgcolor: "#EFF6FF",
                                              "&:hover": {
                                                bgcolor: "#0056D2",
                                                color: "#FFFFFF",
                                                borderColor: "#0056D2",
                                              },
                                            }}
                                          >
                                            Pagar
                                          </Button>
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )
                              )}
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>

            ) : (
              /* Formulario de Pago de la Empresa Seleccionada */
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ mb: 2 }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => setSelectedProvider(null)}
                    sx={{ textTransform: "none", fontWeight: 700, color: "#0056D2" }}
                  >
                    Volver a elegir empresa
                  </Button>
                </Box>

                <Card sx={{ maxWidth: 650, mx: "auto", borderRadius: "20px", p: { xs: 2.5, sm: 3.5 }, border: "1px solid", borderColor: "divider", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                  <CardContent sx={{ p: 0 }}>
                    {/* Cabecera de Empresa (solo nombre y categoría, limpio) */}
                    <Box sx={{ pb: 2, mb: 3, borderBottom: "1px solid #F1F5F9" }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: "text.primary", letterSpacing: "-0.02em" }}>
                        {selectedProvider.name}
                      </Typography>
                      <Chip
                        label={selectedProvider.categoryName}
                        size="small"
                        sx={{
                          mt: 0.8,
                          height: 22,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          bgcolor: "#EFF6FF",
                          color: "#0056D2",
                          borderRadius: "8px",
                          border: "1px solid #DBEAFE",
                        }}
                      />
                    </Box>


                    {paymentError && (
                      <Alert severity="error" sx={{ mb: 2.5, borderRadius: "12px" }}>
                        {paymentError}
                      </Alert>
                    )}

                    {/* Paso 1: Código de Pago / Cliente */}
                    <Box sx={{ mb: 2.5 }}>
                      <Typography sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.88rem", mb: 0.8 }}>
                        {selectedProvider.codeLabel}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                          fullWidth
                          placeholder={`Ingresá tu ${selectedProvider.codeLabel.toLowerCase()}`}
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          slotProps={{ input: { sx: { borderRadius: "12px" } } }}
                        />
                        <Button
                          variant="outlined"
                          onClick={handleConsultInvoice}
                          disabled={consultingInvoice || !referenceNumber.trim()}
                          sx={{
                            borderRadius: "12px",
                            px: 2.5,
                            fontWeight: 700,
                            textTransform: "none",
                            whiteSpace: "nowrap",
                            borderColor: "#0056D2",
                            color: "#0056D2",
                          }}
                        >
                          {consultingInvoice ? <CircularProgress size={20} /> : "Consultar Deuda"}
                        </Button>
                      </Box>
                    </Box>

                    {/* Datos de Factura Simulada si consultó */}
                    {invoiceInfo && (
                      <Box
                        sx={{
                          mb: 3,
                          p: 2,
                          bgcolor: "action.hover",
                          borderRadius: "14px",
                          border: "1px solid", borderColor: "divider",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                          <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>Factura Nº:</Typography>
                          <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.85rem" }}>
                            {invoiceInfo.invoiceNumber}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                          <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>Vencimiento:</Typography>
                          <Typography sx={{ fontWeight: 700, color: "#DC2626", fontSize: "0.85rem" }}>
                            {new Date(invoiceInfo.dueDate).toLocaleDateString("es-AR")}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>Importe Liquidado:</Typography>
                          <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: "1rem" }}>
                            {formatCurrency(invoiceInfo.amount)}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Monto a Pagar */}
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.88rem", mb: 0.8 }}>
                        Monto a Abonar (ARS)
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            sx: { borderRadius: "12px", fontSize: "1.1rem", fontWeight: 700 },
                          },
                        }}
                      />
                    </Box>

                    {/* Selector de Origen de Fondos (Cuenta o Reservas) */}
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.88rem", mb: 0.8 }}>
                        Pagar con Fondos de:
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={selectedSource}
                          onChange={(e) => setSelectedSource(e.target.value)}
                          sx={{ borderRadius: "12px" }}
                        >
                          <MenuItem value="account">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                              <ReceiptLongIcon sx={{ color: "#0056D2", fontSize: 20 }} />
                              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                Cuenta Principal · Disponible: {formatCurrency(account.money)}
                              </Typography>
                            </Box>
                          </MenuItem>
                          {reserves.map((res) => (
                            <MenuItem key={res.id} value={res.id}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                <SavingsOutlinedIcon sx={{ color: "#7C3AED", fontSize: 20 }} />
                                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                  Reserva: {res.name} · Saldo: {formatCurrency(res.currentBalance)}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Botón de Confirmación */}
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleExecutePayment}
                      disabled={submittingPayment || !referenceNumber.trim() || !amount}
                      sx={{
                        borderRadius: "14px",
                        py: 1.5,
                        fontWeight: 800,
                        fontSize: "1rem",
                        textTransform: "none",
                        bgcolor: "#0056D2",
                        "&:hover": { bgcolor: "#00419E" },
                      }}
                    >
                      {submittingPayment ? <CircularProgress size={24} color="inherit" /> : "Confirmar y Abonar Factura"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {/* TAB 1: Mis Comprobantes de Servicios */}
        {tab === 1 && (
          <Box>
            {loadingPayments ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : myPayments.length === 0 ? (
              <Paper sx={{ p: 5, textAlign: "center", borderRadius: "18px", border: "1px solid", borderColor: "divider" }}>
                <ReceiptLongIcon sx={{ fontSize: 54, color: "#94A3B8", mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                  Aún no registras pagos de servicios
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", mt: 0.5, mb: 2.5 }}>
                  Tus facturas abonadas aparecerán aquí con su respectivo comprobante oficial.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setTab(0)}
                  sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, bgcolor: "#0056D2" }}
                >
                  Pagar un Servicio Ahora
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {myPayments.map((p) => (
                  <Card key={p.id} sx={{ p: 2, borderRadius: "16px", border: "1px solid", borderColor: "divider", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            bgcolor: "#EFF6FF",
                            color: "#0056D2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <ReceiptLongIcon sx={{ fontSize: "1.4rem" }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: "1rem" }}>
                            {p.providerName}
                          </Typography>
                          <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                            {p.categoryName} · Ref: {p.referenceNumber}
                          </Typography>
                          <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem", mt: 0.3 }}>
                            {new Date(p.paymentDate).toLocaleString("es-AR")} · {p.reserveName ? `Desde reserva '${p.reserveName}'` : "Cuenta corriente"}
                          </Typography>
                        </Box>
                      </Box>



                      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Typography sx={{ fontWeight: 900, color: "text.primary", fontSize: "1.15rem" }}>
                          {formatCurrency(p.amount)}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadOutlinedIcon />}
                          onClick={() =>
                            downloadServicePaymentReceiptPdf({
                              receiptNumber: p.receiptNumber,
                              providerName: p.providerName,
                              categoryName: p.categoryName,
                              referenceNumber: p.referenceNumber,
                              amount: p.amount,
                              paymentDate: new Date(p.paymentDate).toLocaleString("es-AR"),
                              payerName: user?.name || user?.email,
                              sourceLabel: p.reserveName ? `Reserva: ${p.reserveName}` : "Cuenta Corriente DigitalArs",
                            })
                          }
                          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, borderColor: "#0056D2", color: "#0056D2" }}
                        >
                          Descargar PDF
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Modal de Comprobante Exitoso */}
        <ServiceReceiptModal
          open={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          paymentData={lastPaymentData}
          user={user}
        />
      </Box>
    </AppLayout>
  );
}

export default ServicesPage;
