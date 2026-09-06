import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import { useAccount } from "../../hooks/useAccount";

const ISSUE_CATEGORIES = [
  { value: "transferencia", label: "Problema con una transferencia" },
  { value: "deposito", label: "Problema con un depósito o acreditación" },
  { value: "seguridad", label: "Seguridad, acceso o inicio de sesión" },
  { value: "limites", label: "Solicitud de aumento de límites operativos" },
  { value: "comisiones", label: "Consulta sobre comisiones o movimientos" },
  { value: "otro", label: "Consulta general u otro motivo" },
];

export function SupportPage() {
  const navigate = useNavigate();
  const { user } = useAccount();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    category: "transferencia",
    transactionId: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg("Por favor completá los campos obligatorios (Nombre, Email y Mensaje).");
      return;
    }

    setLoading(true);

    // Simulación de creación de ticket de soporte
    setTimeout(() => {
      const generatedId = `TK-${Math.floor(100000 + Math.random() * 900000)}`;
      setLoading(false);
      setSuccessTicket({
        id: generatedId,
        date: new Date().toLocaleString("es-AR", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        category:
          ISSUE_CATEGORIES.find((c) => c.value === formData.category)?.label ||
          formData.category,
      });
      // Limpiar mensaje
      setFormData((prev) => ({ ...prev, transactionId: "", message: "" }));
    }, 800);
  };

  return (
    <AppLayout activeSidebarItem="soporte" maxWidth={1100}>
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
          }}
        >
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
              <HeadsetMicOutlinedIcon fontSize="medium" />
            </Box>
            <Typography variant="overline" sx={{ letterSpacing: "0.1em", fontWeight: 700, color: "#38B6FF" }}>
              Atención Personalizada
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
            Soporte al Usuario
          </Typography>

          <Typography variant="body1" sx={{ color: "#D0D9E5", maxWidth: 650, fontSize: "1rem" }}>
            ¿Tuviste algún inconveniente con una operación o tu cuenta? Nuestro equipo técnico y de atención al cliente está listo para resolverlo a la brevedad.
          </Typography>
        </Box>

        {/* Canales de Contacto Directo */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#001639", mb: 2 }}>
          Canales de Contacto Directo
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {/* WhatsApp */}
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                height: "100%",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 2.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#25D366",
                  boxShadow: "0 6px 20px rgba(37, 211, 102, 0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "12px",
                    bgcolor: "rgba(37, 211, 102, 0.12)",
                    color: "#128C7E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <ChatOutlinedIcon fontSize="medium" />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#001639", mb: 0.5 }}>
                  Chat de WhatsApp
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
                  Conversá en tiempo real con un asistente especializado.
                </Typography>
                <Typography variant="caption" sx={{ color: "#0F172A", fontWeight: 600, display: "block", mb: 2 }}>
                  Lun a Vie: 9:00 a 20:00 hs
                </Typography>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                href="https://wa.me/5491155553277"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "#128C7E",
                  borderColor: "#128C7E",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  "&:hover": {
                    bgcolor: "rgba(37, 211, 102, 0.08)",
                    borderColor: "#075E54",
                  },
                }}
              >
                Abrir WhatsApp
              </Button>
            </Card>
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                height: "100%",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 2.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#0056D2",
                  boxShadow: "0 6px 20px rgba(0, 86, 210, 0.12)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "12px",
                    bgcolor: "#EEF4FF",
                    color: "#0056D2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <EmailOutlinedIcon fontSize="medium" />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#001639", mb: 0.5 }}>
                  Correo Electrónico
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
                  soporte@digitalars.com
                </Typography>
                <Typography variant="caption" sx={{ color: "#0F172A", fontWeight: 600, display: "block", mb: 2 }}>
                  Respuesta estimada en &lt; 24 hs
                </Typography>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                href="mailto:soporte@digitalars.com?subject=Consulta%20de%20Soporte%20DigitalArs"
                sx={{
                  color: "#0056D2",
                  borderColor: "#0056D2",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  "&:hover": {
                    bgcolor: "#F0F6FF",
                    borderColor: "#0047B3",
                  },
                }}
              >
                Enviar Email
              </Button>
            </Card>
          </Grid>

          {/* Teléfono Urgencias */}
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                height: "100%",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 2.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#E11D48",
                  boxShadow: "0 6px 20px rgba(225, 29, 72, 0.12)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "12px",
                    bgcolor: "rgba(225, 29, 72, 0.1)",
                    color: "#E11D48",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <PhoneInTalkOutlinedIcon fontSize="medium" />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#001639", mb: 0.5 }}>
                  Línea de Urgencias
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
                  0800-333-DARS (3277)
                </Typography>
                <Typography variant="caption" sx={{ color: "#0F172A", fontWeight: 600, display: "block", mb: 2 }}>
                  Bloqueo de cuenta y emergencias 24/7
                </Typography>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                href="tel:08003333277"
                sx={{
                  color: "#E11D48",
                  borderColor: "#E11D48",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  "&:hover": {
                    bgcolor: "rgba(225, 29, 72, 0.06)",
                    borderColor: "#BE123C",
                  },
                }}
              >
                Llamar Ahora
              </Button>
            </Card>
          </Grid>
        </Grid>

        {/* Formulario de Creación de Ticket */}
        <Card
          sx={{
            borderRadius: "20px",
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0, 22, 57, 0.04)",
            p: { xs: 2.5, sm: 4 },
            mb: 4,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#001639", mb: 0.5 }}>
              Generar un Ticket de Soporte
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Completá los detalles de tu consulta. Te enviaremos el número de caso y el seguimiento a tu correo.
            </Typography>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0F172A", mb: 0.5, display: "block" }}>
                  Nombre y Apellido *
                </Typography>
                <TextField
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0F172A", mb: 0.5, display: "block" }}>
                  Correo Electrónico *
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0F172A", mb: 0.5, display: "block" }}>
                  Motivo de la consulta *
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                >
                  {ISSUE_CATEGORIES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0F172A", mb: 0.5, display: "block" }}>
                  N° de Transacción / ID de Referencia (Opcional)
                </Typography>
                <TextField
                  fullWidth
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  placeholder="Ej. #TX-104928 o ID de comprobante"
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0F172A", mb: 0.5, display: "block" }}>
                  Descripción detallada *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Explicá con el mayor detalle posible lo ocurrido..."
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{
                    bgcolor: "#0056D2",
                    color: "#FFFFFF",
                    px: 3.5,
                    py: 1.3,
                    borderRadius: "12px",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0047B3" },
                    boxShadow: "0 4px 14px rgba(0, 86, 210, 0.25)",
                  }}
                >
                  {loading ? "Enviando ticket..." : "Enviar Ticket de Soporte"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Banner hacia Centro de Ayuda */}
        <Card
          sx={{
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            bgcolor: "#F8FAFC",
            p: 2.5,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HelpOutlineOutlinedIcon sx={{ color: "#0056D2", fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#001639" }}>
                  ¿Buscás respuestas inmediatas sobre cómo operar?
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  Revisá los tutoriales y preguntas frecuentes en nuestro Centro de Ayuda.
                </Typography>
              </Box>
            </Stack>
            <Button
              size="small"
              onClick={() => navigate("/help")}
              endIcon={<ArrowForwardIcon fontSize="small" />}
              sx={{ textTransform: "none", fontWeight: 700, color: "#0056D2" }}
            >
              Ir a Preguntas Frecuentes
            </Button>
          </Stack>
        </Card>

        {/* Modal de Ticket Creado */}
        <Dialog
          open={Boolean(successTicket)}
          onClose={() => setSuccessTicket(null)}
          PaperProps={{
            sx: {
              borderRadius: "20px",
              p: 2,
              maxWidth: 460,
              textAlign: "center",
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "#DCFCE7",
                color: "#15803D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
              }}
            >
              <CheckCircleOutlinedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#001639" }}>
              ¡Ticket Registrado!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
              Hemos recibido tu consulta con éxito. Un representante de nuestro equipo te contactará por email en menos de 24 horas.
            </Typography>

            <Box
              sx={{
                bgcolor: "#F8FAFC",
                p: 2,
                borderRadius: "12px",
                border: "1px dashed #CBD5E1",
                textAlign: "left",
              }}
            >
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  Número de Ticket:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#0056D2" }}>
                  {successTicket?.id}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  Motivo:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0F172A" }}>
                  {successTicket?.category}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" sx={{ color: "#64748B" }}>
                  Fecha y Hora:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 500, color: "#0F172A" }}>
                  {successTicket?.date}
                </Typography>
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setSuccessTicket(null)}
              sx={{
                bgcolor: "#0056D2",
                color: "#FFFFFF",
                px: 4,
                py: 1,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#0047B3" },
              }}
            >
              Entendido
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
}

export default SupportPage;
