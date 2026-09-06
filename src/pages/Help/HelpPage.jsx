import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Stack,
  Divider,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";

const CATEGORIES = [
  { id: "all", label: "Todas", icon: null },
  { id: "transfers", label: "Transferencias", icon: <SwapHorizOutlinedIcon fontSize="small" /> },
  { id: "deposits", label: "Depósitos y Saldo", icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
  { id: "security", label: "Seguridad y Cuenta", icon: <SecurityOutlinedIcon fontSize="small" /> },
  { id: "card", label: "Tarjeta y Límites", icon: <CreditCardOutlinedIcon fontSize="small" /> },
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: "transfers",
    question: "¿Cómo realizo una transferencia de dinero?",
    answer:
      "Ingresá en la sección 'Transferencias' desde el menú lateral o el botón del inicio. Seleccioná un destinatario frecuente o ingresá su CVU, CBU o Alias. Luego especificá el monto, seleccioná el motivo o concepto del envío y confirmá la transacción. ¡El dinero se debita y envía al instante!",
  },
  {
    id: 2,
    category: "transfers",
    question: "¿Cuánto demora en impactar una transferencia?",
    answer:
      "Las transferencias entre cuentas DigitalArs y hacia otros bancos o billeteras virtuales son inmediatas y están disponibles las 24 horas del día, los 365 días del año.",
  },
  {
    id: 3,
    category: "transfers",
    question: "¿Dónde puedo descargar el comprobante de una transferencia?",
    answer:
      "Al finalizar cualquier transferencia verás el botón 'Información de la transferencia' para ver todos los detalles y descargarlo en formato PDF. Además, en la sección 'Historial' podés hacer clic sobre cualquier movimiento para abrir el comprobante y descargarlo cuando lo desees.",
  },
  {
    id: 4,
    category: "deposits",
    question: "¿Cómo ingreso o deposito dinero a mi cuenta DigitalArs?",
    answer:
      "Podés ingresar dinero mediante transferencia bancaria utilizando tu CVU o Alias oficial que figura en la tarjeta de tu Inicio. También podés ir a la opción 'Depositar' en el menú o accesos directos e ingresar fondos seleccionando el monto y motivo correspondiente.",
  },
  {
    id: 5,
    category: "deposits",
    question: "¿Tiene algún costo o comisión depositar dinero?",
    answer:
      "No, ingresar dinero a tu billetera virtual DigitalArs es 100% gratuito. No cobramos comisiones de apertura, mantenimiento ni depósito.",
  },
  {
    id: 6,
    category: "security",
    question: "¿Cómo cambio mi contraseña o actualizo mis datos?",
    answer:
      "Ingresá a la sección 'Perfil' desde el menú. Allí podrás visualizar tus datos personales y hacer clic en 'Editar datos personales' o actualizar tu contraseña ingresando tu clave actual y la nueva.",
  },
  {
    id: 7,
    category: "security",
    question: "¿Qué debo hacer si desconozco un movimiento en mi cuenta?",
    answer:
      "Revisá primero el comprobante completo en tu 'Historial' para verificar la contraparte y el motivo. Si confirmás que se trata de un movimiento no reconocido, comunicate inmediatamente con nuestro equipo a través de la sección 'Soporte' para congelar preventivamente tu cuenta e iniciar una revisión.",
  },
  {
    id: 8,
    category: "card",
    question: "¿Cuáles son los límites de transferencia diarios?",
    answer:
      "El límite estándar de operaciones diarias es de $2.000.000 ARS. Si necesitás elevar tu límite operativo para una operación comercial o inmobiliaria, podés solicitar una ampliación adjuntando documentación en la sección de Soporte.",
  },
  {
    id: 9,
    category: "card",
    question: "¿Dónde encuentro mi CVU y Alias?",
    answer:
      "Tu CVU se encuentra destacado en la tarjeta principal 'DigitalArs Card' en la pantalla de Inicio. También podés consultarlo en todo momento dentro de tu pantalla de Perfil.",
  },
];

export function HelpPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expanded, setExpanded] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const cleanQuery = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !cleanQuery ||
        item.question.toLowerCase().includes(cleanQuery) ||
        item.answer.toLowerCase().includes(cleanQuery);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <AppLayout activeSidebarItem="ayuda" maxWidth={1100}>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Hero */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #001639 0%, #002B66 100%)",
            color: "#FFFFFF",
            p: { xs: 3, sm: 4 },
            borderRadius: "20px",
            mb: 4,
            boxShadow: "0 10px 30px rgba(0, 22, 57, 0.12)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 2, maxWidth: 680 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  bgcolor: "rgba(56, 182, 255, 0.15)",
                  color: "#38B6FF",
                  p: 1,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <HelpOutlineOutlinedIcon fontSize="medium" />
              </Box>
              <Typography variant="overline" sx={{ letterSpacing: "0.1em", fontWeight: 700, color: "#38B6FF" }}>
                Base de conocimientos
              </Typography>
            </Stack>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                mb: 1.5,
                fontSize: { xs: "1.75rem", sm: "2.2rem" },
              }}
            >
              ¿Cómo podemos ayudarte hoy?
            </Typography>

            <Typography variant="body1" sx={{ color: "#D0D9E5", mb: 3, fontSize: "1rem" }}>
              Encontrá respuestas rápidas, guías prácticas y tutoriales sobre el funcionamiento de tu billetera DigitalArs.
            </Typography>

            {/* Input Buscador */}
            <TextField
              fullWidth
              placeholder="Buscá por palabra clave (ej. transferir, límite, comprobante)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#0056D2" }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: "#FFFFFF",
                  borderRadius: "14px",
                  "& fieldset": { border: "none" },
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  fontSize: "0.95rem",
                },
              }}
            />
          </Box>
        </Box>

        {/* Categorías (Pills) */}
        <Box sx={{ mb: 3.5 }}>
          <Typography variant="subtitle2" sx={{ color: "#64748B", fontWeight: 600, mb: 1.5 }}>
            FILTRAR POR CATEGORÍA
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Chip
                  key={cat.id}
                  icon={cat.icon ? cat.icon : undefined}
                  label={cat.label}
                  onClick={() => setSelectedCategory(cat.id)}
                  clickable
                  sx={{
                    fontWeight: 600,
                    px: 1.5,
                    py: 2.2,
                    borderRadius: "12px",
                    bgcolor: isSelected ? "#0056D2" : "#FFFFFF",
                    color: isSelected ? "#FFFFFF" : "#475569",
                    border: isSelected ? "1px solid #0056D2" : "1px solid #E2E8F0",
                    boxShadow: isSelected ? "0 4px 12px rgba(0, 86, 210, 0.25)" : "none",
                    "&:hover": {
                      bgcolor: isSelected ? "#0047B3" : "#F1F5F9",
                    },
                    "& .MuiChip-icon": {
                      color: isSelected ? "#FFFFFF" : "#64748B",
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* Lista de Preguntas Frecuentes (Acordeones) */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#001639" }}>
              Preguntas Frecuentes ({filteredFaqs.length})
            </Typography>
            {searchTerm && (
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                sx={{ textTransform: "none", color: "#0056D2", fontWeight: 600 }}
              >
                Limpiar búsqueda
              </Button>
            )}
          </Stack>

          {filteredFaqs.length === 0 ? (
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: "16px",
                border: "1px dashed #CBD5E1",
                bgcolor: "#FFFFFF",
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 48, color: "#94A3B8", mb: 1.5 }} />
              <Typography variant="h6" sx={{ color: "#334155", fontWeight: 700, mb: 0.5 }}>
                No encontramos resultados para tu búsqueda
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
                Probá con otras palabras o contactate directamente con nuestro equipo de Soporte.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/support")}
                startIcon={<HeadsetMicOutlinedIcon />}
                sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600 }}
              >
                Contactar a Soporte
              </Button>
            </Card>
          ) : (
            filteredFaqs.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expanded === `panel${faq.id}`}
                onChange={handleAccordionChange(`panel${faq.id}`)}
                sx={{
                  mb: 1.5,
                  borderRadius: "14px !important",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  "&:before": { display: "none" },
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  "&.Mui-expanded": {
                    borderColor: "#38B6FF",
                    boxShadow: "0 6px 18px rgba(0, 86, 210, 0.08)",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#0056D2" }} />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    "& .MuiAccordionSummary-content": { my: 1 },
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: "#001639", fontSize: "1.05rem" }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <Divider sx={{ borderColor: "#F1F5F9" }} />
                <AccordionDetails sx={{ px: 3, py: 2.5, bgcolor: "#FAFCFF" }}>
                  <Typography variant="body1" sx={{ color: "#475569", lineHeight: 1.7, fontSize: "0.95rem" }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>

        {/* Tarjeta de Derivación a Soporte */}
        <Card
          sx={{
            borderRadius: "20px",
            border: "1px solid #D0E1FD",
            bgcolor: "#F0F6FF",
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: "14px",
                    bgcolor: "#0056D2",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <HeadsetMicOutlinedIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#001639", mb: 0.5 }}>
                    ¿Tenés un problema específico o necesitás asistencia personalizada?
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    Abrí un ticket de reclamo o comunicate por nuestros canales oficiales de atención al cliente.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: { xs: "left", sm: "right" } }}>
              <Button
                variant="contained"
                onClick={() => navigate("/support")}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#0056D2",
                  color: "#FFFFFF",
                  px: 3,
                  py: 1.4,
                  borderRadius: "12px",
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0047B3" },
                  boxShadow: "0 4px 14px rgba(0, 86, 210, 0.25)",
                }}
              >
                Ir a Soporte
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </AppLayout>
  );
}

export default HelpPage;
