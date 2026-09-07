import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ContactlessIcon from "@mui/icons-material/Contactless";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import AppLayout from "../../components/layout/AppLayout";
import cardService from "../../services/cardService";
import { useAuth } from "../../context/AuthContext";

export function CardsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [revealedCard, setRevealedCard] = useState(null);
  const [revealing, setRevealing] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [copying, setCopying] = useState(false);

  // Modal confirmación baja
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  // Feedback Toast
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Cargar tarjetas del usuario
  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await cardService.getMyCards();
      setCards(data || []);
    } catch (err) {
      console.error("Error al cargar tarjetas:", err);
      showToast("No se pudieron cargar las tarjetas.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // Solicitar tarjeta virtual
  const handleRequestVirtualCard = async () => {
    try {
      setRequesting(true);
      const newCard = await cardService.requestVirtualCard();
      setCards((prev) => [newCard, ...prev]);
      showToast("¡Tu Tarjeta Virtual DigitalArs ha sido emitida con éxito!");
    } catch (err) {
      console.error("Error al solicitar tarjeta:", err);
      const msg =
        err.response?.data?.message ||
        "No se pudo emitir la tarjeta virtual. Intenta nuevamente.";
      showToast(msg, "error");
    } finally {
      setRequesting(false);
    }
  };

  // Revelar / Ocultar datos de la tarjeta
  const handleToggleReveal = async (card) => {
    if (revealedCard && revealedCard.id === card.id) {
      setRevealedCard(null);
      return;
    }

    try {
      setRevealing(true);
      const fullData = await cardService.revealCard(card.id);
      setRevealedCard(fullData);
      showToast("Datos visibles por motivos de seguridad.", "info");
    } catch (err) {
      console.error("Error al revelar tarjeta:", err);
      showToast("No se pudieron obtener los datos completos.", "error");
    } finally {
      setRevealing(false);
    }
  };

  // Congelar / Descongelar tarjeta
  const handleToggleFreeze = async (card) => {
    try {
      setFreezing(true);
      const updated = await cardService.toggleFreeze(card.id);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, isFrozen: updated.isFrozen } : c))
      );
      if (revealedCard && revealedCard.id === card.id) {
        setRevealedCard((prev) => ({ ...prev, isFrozen: updated.isFrozen }));
      }
      showToast(
        updated.isFrozen
          ? "Tarjeta congelada. No se permitirán nuevas transacciones."
          : "Tarjeta descongelada. Lista para operar.",
        "success"
      );
    } catch (err) {
      console.error("Error al modificar estado de congelamiento:", err);
      showToast("No se pudo cambiar el estado de la tarjeta.", "error");
    } finally {
      setFreezing(false);
    }
  };

  // Abrir confirmación de baja
  const handleOpenDeleteModal = (card) => {
    setCardToDelete(card);
    setDeleteModalOpen(true);
  };

  // Confirmar baja definitiva
  const handleConfirmDeactivation = async () => {
    if (!cardToDelete) return;
    try {
      setDeactivating(true);
      await cardService.deactivateCard(cardToDelete.id);
      setCards((prev) => prev.filter((c) => c.id !== cardToDelete.id));
      if (revealedCard && revealedCard.id === cardToDelete.id) {
        setRevealedCard(null);
      }
      setDeleteModalOpen(false);
      setCardToDelete(null);
      showToast("La tarjeta ha sido dada de baja correctamente.");
    } catch (err) {
      console.error("Error al dar de baja la tarjeta:", err);
      showToast("Error al dar de baja la tarjeta.", "error");
    } finally {
      setDeactivating(false);
    }
  };

  // Copiar número completo (16 dígitos) al portapapeles
  const handleCopyNumber = async (card) => {
    if (!card) return;
    try {
      setCopying(true);
      let numberToCopy = "";
      if (revealedCard && revealedCard.id === card.id && revealedCard.cardNumber) {
        numberToCopy = revealedCard.cardNumber.replace(/\s+/g, "");
      } else {
        const fullData = await cardService.revealCard(card.id);
        numberToCopy = fullData.cardNumber.replace(/\s+/g, "");
      }
      await navigator.clipboard.writeText(numberToCopy);
      showToast("Número completo (16 dígitos) copiado al portapapeles");
    } catch (err) {
      console.error("Error al copiar número:", err);
      showToast("No se pudo obtener el número completo para copiar.", "error");
    } finally {
      setCopying(false);
    }
  };

  const activeVirtualCard = cards.find(
    (c) => c.type?.toLowerCase() === "virtual" && c.isActive
  );

  return (
    <AppLayout activeSidebarItem="tarjetas">
      <Box sx={{ maxWidth: 900, mx: "auto", pb: 6 }}>
        {/* Cabecera Principal */}
        <Box sx={{ mb: 4, textAlign: { xs: "center", sm: "left" } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#0F172A",
              fontSize: { xs: "1.75rem", sm: "2.25rem" },
              letterSpacing: "-0.02em",
              mb: 1,
            }}
          >
            {activeVirtualCard ? "Mis Tarjetas" : "Escoge tu Tarjeta DigitalArs"}
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748B", fontSize: "1rem" }}>
            {activeVirtualCard
              ? "Administrá tu tarjeta virtual al instante, gestioná su seguridad y visualizá tus beneficios."
              : "Operá de forma ágil, segura y sin comisiones ocultas tanto en comercios locales como del exterior."}
          </Typography>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 280,
            }}
          >
            <CircularProgress sx={{ color: "#0056D2" }} />
          </Box>
        ) : (
          <Box>
            {/* SECCIÓN 1: SI EL USUARIO YA TIENE SU TARJETA VIRTUAL */}
            {activeVirtualCard && (
              <Box sx={{ mb: 5 }}>
                {/* Visualizador de la Tarjeta */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: "100%", maxWidth: 460 }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        aspectRatio: "1.586 / 1",
                        borderRadius: "20px",
                        position: "relative",
                        overflow: "hidden",
                        p: { xs: 2.5, sm: 3.5 },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: activeVirtualCard.isFrozen
                          ? "0 20px 40px -15px rgba(56, 182, 255, 0.4)"
                          : "0 20px 40px -15px rgba(0, 86, 210, 0.45)",
                        background: activeVirtualCard.isFrozen
                          ? "linear-gradient(135deg, #1E293B 0%, #0F172A 60%, #1E3A8A 100%)"
                          : "linear-gradient(135deg, #02122C 0%, #002B66 50%, #0056D2 100%)",
                        color: "#FFFFFF",
                        border: activeVirtualCard.isFrozen
                          ? "1.5px solid rgba(56, 182, 255, 0.6)"
                          : "1.5px solid rgba(255, 255, 255, 0.15)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {/* Efecto decorativo de brillo */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: -60,
                          right: -60,
                          width: 180,
                          height: 180,
                          borderRadius: "50%",
                          background: activeVirtualCard.isFrozen
                            ? "radial-gradient(circle, rgba(56, 182, 255, 0.25) 0%, transparent 70%)"
                            : "radial-gradient(circle, rgba(0, 200, 255, 0.3) 0%, transparent 70%)",
                          pointerEvents: "none",
                        }}
                      />

                      {/* Capa de Tarjeta Congelada (Icy Overlay) */}
                      {activeVirtualCard.isFrozen && (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            bgcolor: "rgba(14, 165, 233, 0.12)",
                            backdropFilter: "blur(2px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                            zIndex: 2,
                          }}
                        >
                          <Chip
                            icon={<AcUnitIcon sx={{ color: "#38BDF8 !important" }} />}
                            label="TARJETA CONGELADA"
                            sx={{
                              bgcolor: "rgba(15, 23, 42, 0.85)",
                              color: "#38BDF8",
                              fontWeight: 800,
                              letterSpacing: "0.08em",
                              fontSize: "0.85rem",
                              border: "1px solid rgba(56, 189, 248, 0.5)",
                              px: 1,
                              py: 2,
                            }}
                          />
                        </Box>
                      )}

                      {/* Fila Superior: Tipo, Chip, Contactless */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          zIndex: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: { xs: "1.1rem", sm: "1.3rem" },
                              letterSpacing: "-0.03em",
                              color: "#FFFFFF",
                            }}
                          >
                            Digital<span style={{ color: "#38B6FF" }}>Ars</span>
                          </Typography>
                          <Chip
                            label="VIRTUAL"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              bgcolor: "rgba(255, 255, 255, 0.15)",
                              color: "#FFFFFF",
                              letterSpacing: "0.05em",
                            }}
                          />
                        </Box>

                        <ContactlessIcon sx={{ fontSize: "1.8rem", color: "rgba(255,255,255,0.85)" }} />
                      </Box>

                      {/* Chip metálico gráfico */}
                      <Box sx={{ zIndex: 1, my: { xs: 0.5, sm: 1 } }}>
                        <Box
                          sx={{
                            width: { xs: 40, sm: 46 },
                            height: { xs: 30, sm: 34 },
                            borderRadius: "6px",
                            background: "linear-gradient(135deg, #FFE082 0%, #FFB300 50%, #FFD54F 100%)",
                            border: "1px solid rgba(0,0,0,0.15)",
                            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.2)",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              border: "1px solid rgba(0,0,0,0.2)",
                              margin: "4px",
                              borderRadius: "3px",
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Fila Central: Número de Tarjeta */}
                      <Box sx={{ zIndex: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: "monospace",
                            fontSize: { xs: "1.15rem", sm: "1.45rem" },
                            fontWeight: 700,
                            letterSpacing: { xs: "0.15em", sm: "0.22em" },
                            color: "#FFFFFF",
                            textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                          }}
                        >
                          {revealedCard
                            ? revealedCard.cardNumber
                            : activeVirtualCard.cardNumber}
                        </Typography>
                      </Box>

                      {/* Fila Inferior: Titular, Expiración, CVV, Logo Visa */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                          zIndex: 1,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255,255,255,0.65)",
                              fontSize: "0.65rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              display: "block",
                            }}
                          >
                            Titular
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: "0.85rem", sm: "0.95rem" },
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            {activeVirtualCard.holderName || user?.name || "USUARIO"}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2.5 }}>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "rgba(255,255,255,0.65)",
                                fontSize: "0.65rem",
                                letterSpacing: "0.08em",
                                display: "block",
                              }}
                            >
                              VENCE
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                                fontFamily: "monospace",
                              }}
                            >
                              {activeVirtualCard.expirationDate}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "rgba(255,255,255,0.65)",
                                fontSize: "0.65rem",
                                letterSpacing: "0.08em",
                                display: "block",
                              }}
                            >
                              CVV
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                                fontFamily: "monospace",
                                color: revealedCard ? "#38BDF8" : "inherit",
                              }}
                            >
                              {revealedCard
                                ? revealedCard.securityCode
                                : activeVirtualCard.securityCode}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontStyle: "italic",
                            fontSize: { xs: "1.3rem", sm: "1.6rem" },
                            letterSpacing: "-0.05em",
                            color: "#FFFFFF",
                          }}
                        >
                          VISA
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                </Box>

                {/* Barra de Acciones Rápidas */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    justifyContent: "center",
                    mb: 4,
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={
                      copying ? (
                        <CircularProgress size={18} sx={{ color: "#334155" }} />
                      ) : (
                        <ContentCopyIcon />
                      )
                    }
                    onClick={() => handleCopyNumber(activeVirtualCard)}
                    disabled={copying}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#CBD5E1",
                      color: "#334155",
                      bgcolor: "#FFFFFF",
                      px: 2,
                      py: 1,
                      "&:hover": {
                        bgcolor: "#F1F5F9",
                        borderColor: "#94A3B8",
                      },
                    }}
                  >
                    {copying ? "Copiando..." : "Copiar número"}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={
                      revealedCard ? <VisibilityOffIcon /> : <VisibilityIcon />
                    }
                    onClick={() => handleToggleReveal(activeVirtualCard)}
                    disabled={revealing}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#CBD5E1",
                      color: "#0056D2",
                      bgcolor: "#FFFFFF",
                      px: 2,
                      py: 1,
                      "&:hover": {
                        bgcolor: "#F0F7FF",
                        borderColor: "#0056D2",
                      },
                    }}
                  >
                    {revealing ? (
                      <CircularProgress size={18} sx={{ color: "#0056D2" }} />
                    ) : revealedCard ? (
                      "Ocultar datos"
                    ) : (
                      "Mostrar datos"
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<AcUnitIcon />}
                    onClick={() => handleToggleFreeze(activeVirtualCard)}
                    disabled={freezing}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: activeVirtualCard.isFrozen ? "#0284C7" : "#CBD5E1",
                      color: activeVirtualCard.isFrozen ? "#0284C7" : "#475569",
                      bgcolor: activeVirtualCard.isFrozen ? "#F0F9FF" : "#FFFFFF",
                      px: 2,
                      py: 1,
                      "&:hover": {
                        bgcolor: activeVirtualCard.isFrozen ? "#E0F2FE" : "#F8FAFC",
                        borderColor: "#0284C7",
                      },
                    }}
                  >
                    {freezing ? (
                      <CircularProgress size={18} />
                    ) : activeVirtualCard.isFrozen ? (
                      "Descongelar tarjeta"
                    ) : (
                      "Congelar tarjeta"
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={() => handleOpenDeleteModal(activeVirtualCard)}
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                    }}
                  >
                    Dar de baja
                  </Button>
                </Box>

                {/* Banner informativo de seguridad */}
                <Alert
                  icon={<ShieldOutlinedIcon fontSize="inherit" />}
                  severity="info"
                  sx={{
                    borderRadius: "14px",
                    bgcolor: "rgba(0, 86, 210, 0.05)",
                    color: "#0F172A",
                    border: "1px solid rgba(0, 86, 210, 0.15)",
                    mb: 5,
                    "& .MuiAlert-icon": { color: "#0056D2" },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.3 }}>
                    Seguridad y protección DigitalArs
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.85rem" }}>
                    Tu tarjeta virtual está protegida contra fraudes y compras no autorizadas.
                    Podés congelarla al instante cuando no la uses o regenerarla dándola de baja y
                    solicitando una nueva.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* SECCIÓN 2: CATÁLOGO DE TARJETAS DISPONIBLES / PRÓXIMAMENTE */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1E293B",
                mb: 2.5,
                fontSize: "1.2rem",
              }}
            >
              {activeVirtualCard
                ? "Otras opciones de tarjetas"
                : "Tarjetas disponibles"}
            </Typography>

            <Grid container spacing={2.5}>
              {/* Tarjeta 1: Tarjeta Virtual (Si aún no la tiene) */}
              {!activeVirtualCard && (
                <Grid item size={{ xs: 12 }}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      sx={{
                        borderRadius: "18px",
                        border: "1.5px solid #0056D2",
                        boxShadow: "0 10px 25px -5px rgba(0, 86, 210, 0.12)",
                        p: { xs: 2.5, sm: 3 },
                        bgcolor: "#FFFFFF",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                        gap: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2.5,
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Miniatura Gráfica Tarjeta Virtual */}
                        <Box
                          sx={{
                            width: { xs: 68, sm: 84 },
                            height: { xs: 44, sm: 54 },
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #02122C 0%, #0056D2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 4px 10px rgba(0, 86, 210, 0.3)",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          <FlashOnIcon sx={{ color: "#38B6FF", fontSize: "1.6rem" }} />
                        </Box>

                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem" }}
                            >
                              Tarjeta virtual
                            </Typography>
                            <Chip
                              label="GRATUITA"
                              size="small"
                              sx={{
                                bgcolor: "#DCFCE7",
                                color: "#166534",
                                fontWeight: 700,
                                fontSize: "0.68rem",
                                height: 22,
                              }}
                            />
                          </Box>
                          <Box component="ul" sx={{ pl: 2, m: 0, color: "#64748B", fontSize: "0.88rem" }}>
                            <li>Instantánea, prepaga, gratuita con cashback en tus compras.</li>
                            <li>Sin impuesto del 30% en compras internacionales seleccionadas.</li>
                            <li>Activación y disponibilidad inmediata en tu cuenta.</li>
                          </Box>
                        </Box>
                      </Box>

                      <Button
                        variant="contained"
                        onClick={handleRequestVirtualCard}
                        disabled={requesting}
                        sx={{
                          borderRadius: "12px",
                          bgcolor: "#0056D2",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          textTransform: "none",
                          px: 3.5,
                          py: 1.2,
                          alignSelf: { xs: "stretch", sm: "center" },
                          flexShrink: 0,
                          boxShadow: "0 4px 14px rgba(0, 86, 210, 0.3)",
                          "&:hover": {
                            bgcolor: "#0047B3",
                          },
                        }}
                      >
                        {requesting ? (
                          <CircularProgress size={22} sx={{ color: "#FFFFFF" }} />
                        ) : (
                          "Pedir"
                        )}
                      </Button>
                    </Card>
                  </motion.div>
                </Grid>
              )}

              {/* Tarjeta 2: Tarjeta Física (Coming Soon) */}
              <Grid item size={{ xs: 12 }}>
                <Card
                  sx={{
                    borderRadius: "18px",
                    border: "1px solid #E2E8F0",
                    p: { xs: 2.5, sm: 3 },
                    bgcolor: "#FFFFFF",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
                    {/* Miniatura Gráfica Tarjeta Física */}
                    <Box
                      sx={{
                        width: { xs: 68, sm: 84 },
                        height: { xs: 44, sm: 54 },
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 4px 10px rgba(15, 23, 42, 0.2)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <LocalShippingOutlinedIcon sx={{ color: "#94A3B8", fontSize: "1.5rem" }} />
                    </Box>

                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem" }}
                        >
                          DigitalArs Card (Física)
                        </Typography>
                        <Chip
                          label="PRÓXIMAMENTE"
                          size="small"
                          sx={{
                            bgcolor: "#F1F5F9",
                            color: "#475569",
                            fontWeight: 700,
                            fontSize: "0.68rem",
                            height: 22,
                          }}
                        />
                      </Box>
                      <Box component="ul" sx={{ pl: 2, m: 0, color: "#64748B", fontSize: "0.88rem" }}>
                        <li>Prepaga, gratuita y con envío a tu domicilio sin cargo.</li>
                        <li>Tecnología Contactless para compras presenciales en comercios.</li>
                        <li>Extracciones en toda la red de cajeros del país.</li>
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    disabled
                    sx={{
                      borderRadius: "12px",
                      bgcolor: "#E2E8F0 !important",
                      color: "#94A3B8 !important",
                      fontWeight: 700,
                      textTransform: "none",
                      px: 3.5,
                      py: 1.2,
                      alignSelf: { xs: "stretch", sm: "center" },
                      flexShrink: 0,
                    }}
                  >
                    Pedir
                  </Button>
                </Card>
              </Grid>

              {/* Tarjeta 3: Tarjeta de Crédito (Coming Soon) */}
              <Grid item size={{ xs: 12 }}>
                <Card
                  sx={{
                    borderRadius: "18px",
                    border: "1px solid #E2E8F0",
                    p: { xs: 2.5, sm: 3 },
                    bgcolor: "#FFFFFF",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: 2.5,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
                    {/* Miniatura Gráfica Tarjeta Crédito */}
                    <Box
                      sx={{
                        width: { xs: 68, sm: 84 },
                        height: { xs: 44, sm: 54 },
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #334155 0%, #1E293B 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 4px 10px rgba(15, 23, 42, 0.2)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <CreditCardIcon sx={{ color: "#CBD5E1", fontSize: "1.5rem" }} />
                    </Box>

                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem" }}
                        >
                          DigitalArs Credit Card
                        </Typography>
                        <Chip
                          label="PRÓXIMAMENTE"
                          size="small"
                          sx={{
                            bgcolor: "#F1F5F9",
                            color: "#475569",
                            fontWeight: 700,
                            fontSize: "0.68rem",
                            height: 22,
                          }}
                        />
                      </Box>
                      <Box component="ul" sx={{ pl: 2, m: 0, color: "#64748B", fontSize: "0.88rem" }}>
                        <li>Respaldada con tu saldo e inversiones en la plataforma.</li>
                        <li>Financiación en cuotas fijas sin trámites burocráticos.</li>
                        <li>Sin historial crediticio previo requerido.</li>
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    disabled
                    sx={{
                      borderRadius: "12px",
                      bgcolor: "#E2E8F0 !important",
                      color: "#94A3B8 !important",
                      fontWeight: 700,
                      textTransform: "none",
                      px: 3.5,
                      py: 1.2,
                      alignSelf: { xs: "stretch", sm: "center" },
                      flexShrink: 0,
                    }}
                  >
                    Pedir
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Modal de Confirmación para Dar de Baja */}
        <Dialog
          open={deleteModalOpen}
          onClose={() => !deactivating && setDeleteModalOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: "18px",
              p: 1.5,
              maxWidth: 440,
              width: "100%",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "#0F172A", pb: 1 }}>
            ¿Dar de baja tu Tarjeta Virtual?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "#64748B", fontSize: "0.95rem" }}>
              Esta acción es <strong>definitiva e irreversible</strong>. Una vez dada de baja,
              la tarjeta quedará inhabilitada de forma permanente para compras o suscripciones.
              Podrás solicitar una nueva tarjeta virtual en cualquier momento cuando lo desees.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              onClick={() => setDeleteModalOpen(false)}
              disabled={deactivating}
              sx={{
                color: "#64748B",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDeactivation}
              disabled={deactivating}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
              }}
            >
              {deactivating ? (
                <CircularProgress size={20} sx={{ color: "#FFFFFF" }} />
              ) : (
                "Confirmar baja"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseToast}
            severity={toast.severity}
            variant="filled"
            sx={{
              width: "100%",
              borderRadius: "12px",
              fontWeight: 600,
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppLayout>
  );
}

export default CardsPage;
