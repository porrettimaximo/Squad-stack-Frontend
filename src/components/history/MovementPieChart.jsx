import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  TextField,
  Tooltip,
  IconButton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import PieChartIcon from "@mui/icons-material/PieChart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SyncIcon from "@mui/icons-material/Sync";

const PALETTE = [
  { main: "#06b6d4", light: "rgba(6, 182, 212, 0.12)", border: "#0891b2" },    // Cyan / Salud
  { main: "#f59e0b", light: "rgba(245, 158, 11, 0.12)", border: "#d97706" },   // Ámbar / Combustible
  { main: "#8b5cf6", light: "rgba(139, 92, 246, 0.12)", border: "#7c3aed" },   // Violeta / Servicios
  { main: "#ec4899", light: "rgba(236, 72, 153, 0.12)", border: "#db2777" },   // Rosa / Compras
  { main: "#10b981", light: "rgba(16, 185, 129, 0.12)", border: "#059669" },   // Esmeralda / Comida
  { main: "#3b82f6", light: "rgba(59, 130, 246, 0.12)", border: "#2563eb" },   // Azul eléctrico
  { main: "#14b8a6", light: "rgba(20, 184, 166, 0.12)", border: "#0d9488" },   // Teal
  { main: "#f97316", light: "rgba(249, 115, 22, 0.12)", border: "#ea580c" },   // Naranja
];

const formatYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const MovementPieChart = ({
  transactions = [],
  onGoToTable,
  onSelectCategory,
  onRefresh,
  loading = false,
}) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Únicamente dos opciones de filtro: 'last30' (predefinido) o 'custom'
  const [filterMode, setFilterMode] = useState("last30");

  // Fechas iniciales para el modo personalizado
  const defaultDates = useMemo(() => {
    const now = new Date();
    const past30 = new Date(now);
    past30.setDate(past30.getDate() - 30);
    return {
      from: formatYMD(past30),
      to: formatYMD(now),
    };
  }, []);

  const [customDateFrom, setCustomDateFrom] = useState(defaultDates.from);
  const [customDateTo, setCustomDateTo] = useState(defaultDates.to);

  // Rango activo de fechas
  const activeDateRange = useMemo(() => {
    if (filterMode === "last30") {
      const now = new Date();
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 30);
      return {
        dateFrom: formatYMD(past30),
        dateTo: formatYMD(now),
        label: "Últimos 30 días",
      };
    }

    return {
      dateFrom: customDateFrom || "",
      dateTo: customDateTo || "",
      label: customDateFrom && customDateTo ? `${customDateFrom} a ${customDateTo}` : "Personalizado",
    };
  }, [filterMode, customDateFrom, customDateTo]);

  // Filtrado de transacciones por fecha
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const { dateFrom, dateTo } = activeDateRange;
    if (!dateFrom && !dateTo) return transactions;

    return transactions.filter((tx) => {
      const raw = tx.date || tx.rawDate;
      if (!raw) return true;
      const dateStr = (typeof raw === "string" && raw.includes("T") && !raw.endsWith("Z") && !raw.includes("+") && !raw.includes("-", 10))
        ? `${raw}Z`
        : raw;
      const txDate = new Date(dateStr);
      if (isNaN(txDate.getTime())) return true;

      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`);
        if (txDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59.999`);
        // Si el filtro de fin incluye el día de hoy, nunca excluir movimientos recientes por desfase horario o UTC
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        if (to >= todayEnd) {
          return true;
        }
        if (txDate > to) return false;
      }
      return true;
    });
  }, [transactions, activeDateRange]);

  // Filtrar y clasificar movimientos agrupados por su motivo o concepto real
  const conceptTransactions = useMemo(() => {
    return filteredTransactions.filter((tx) => {
      const amount = Math.abs(Number(tx.amount) || 0);
      return amount > 0;
    });
  }, [filteredTransactions]);

  // Procesar datos para el gráfico Donut agrupado por concepto/motivo real
  const chartData = useMemo(() => {
    if (!conceptTransactions || conceptTransactions.length === 0) return [];

    const acc = {};
    conceptTransactions.forEach((tx) => {
      const amount = Math.abs(Number(tx.amount) || 0);
      if (amount <= 0) return;

      // Obtener el motivo de forma prioritaria
      let motive = (tx.motive || tx.reason || tx.concept || "").trim();

      // Si no tiene motivo o es un nombre genérico, deducir
      if (!motive || motive === "EGRESO" || motive === "INGRESO" || motive === "DEPÓSITO" || motive.startsWith("Transferencia")) {
        const title = (tx.title || "").toLowerCase();
        if (title.includes("alquiler") || title.includes("vivienda")) motive = "Alquiler";
        else if (title.includes("comida") || title.includes("starbucks") || title.includes("alimento")) motive = "Comidas y bebidas";
        else if (title.includes("servicio") || title.includes("edenor") || title.includes("spotify") || title.includes("netflix")) motive = "Cuentas y servicios";
        else if (title.includes("salud") || title.includes("farmacity") || title.includes("médico")) motive = "Salud";
        else if (title.includes("combustible") || title.includes("ypf") || title.includes("transporte")) motive = "Transporte";
        else if (title.includes("compra") || title.includes("coto") || title.includes("mercado libre")) motive = "Compras";
        else if (title.includes("educacion") || title.includes("educación") || title.includes("curso")) motive = "Educación";
        else if (title.includes("entretenimiento") || title.includes("cine")) motive = "Entretenimiento y cultura";
        else if (title.includes("honorario") || title.includes("profesional")) motive = "Honorarios profesionales";
        else if (title.includes("haber") || title.includes("sueldo")) motive = "Haberes";
        else if (title.includes("depósito") || title.includes("deposito") || title.includes("ahorro")) motive = "Ahorro";
        else if (title.includes("transferencia")) motive = "Familia y amigos";
        else motive = "Varios";
      }

      if (!acc[motive]) {
        acc[motive] = { count: 0, total: 0 };
      }
      acc[motive].count += 1;
      acc[motive].total += amount;
    });

    return Object.entries(acc)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([name, data], idx) => {
        const colorPair = PALETTE[idx % PALETTE.length];
        return {
          name,
          label: name,
          count: data.count,
          total: data.total,
          color: colorPair.main,
          lightColor: colorPair.light,
        };
      });
  }, [conceptTransactions]);

  const totalSum = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.total, 0);
  }, [chartData]);

  // Construir arcos SVG interactivos para el Donut compacto
  const slices = useMemo(() => {
    if (totalSum === 0) return [];
    let cumulativePercent = 0;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    return chartData.map((item, idx) => {
      const percentage = (item.total / totalSum) * 100;
      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulativePercent / 100) * circumference);
      cumulativePercent += percentage;

      return {
        ...item,
        id: idx,
        percentage: percentage.toFixed(1),
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [chartData, totalSum]);

  const activeSlice = hoveredSlice !== null ? slices[hoveredSlice] : null;

  // Manejador de clic en una categoría para saltar a la tabla con filtros
  const handleCategoryClick = (categoryName) => {
    if (onSelectCategory) {
      onSelectCategory({
        concept: categoryName,
        dateFrom: activeDateRange.dateFrom,
        dateTo: activeDateRange.dateTo,
      });
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "20px",
        background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        boxShadow: "0 14px 30px -10px rgba(0, 86, 210, 0.06), 0 4px 10px -2px rgba(15, 23, 42, 0.03)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Luz decorativa de fondo suave */}
      <Box
        sx={{
          position: "absolute",
          top: -70,
          right: -70,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 86, 210, 0.06) 0%, rgba(255, 255, 255, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Cabecera: 'Movimientos de la cuenta' con Total a la izquierda y Botones chicos a la derecha */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.8,
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
        }}
      >
        {/* Métrica 'Movimientos de la cuenta' a la izquierda */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0056D2 0%, #2563eb 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px -2px rgba(0, 86, 210, 0.3)",
              flexShrink: 0,
            }}
          >
            <PieChartIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                lineHeight: 1.2,
              }}
            >
              Movimientos de la cuenta
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8, mt: 0.1 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.25rem", sm: "1.45rem" },
                  color: "#0f172a",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                ${totalSum.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Typography>
              <Chip
                label={`${conceptTransactions.length} operaciones`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: "#EFF6FF",
                  color: "#0056D2",
                  borderRadius: "6px",
                  px: 0.3,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Botones más chicos a la derecha */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {/* Botón de recarga rápida */}
          {onRefresh && (
            <Tooltip title="Actualizar datos">
              <span>
                <IconButton
                  size="small"
                  onClick={onRefresh}
                  disabled={loading}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "9px",
                    bgcolor: "#F1F5F9",
                    border: "1px solid #E2E8F0",
                    color: "#0056D2",
                    "&:hover": { bgcolor: "#EEF4FF", borderColor: "#CBD5E1" },
                  }}
                >
                  <SyncIcon
                    sx={{
                      fontSize: 18,
                      animation: loading ? "spin 1s linear infinite" : "none",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          )}

          {/* Selector de 2 botones chicos */}
          <Box
            sx={{
              display: "flex",
              p: 0.35,
              borderRadius: "10px",
              bgcolor: "#F1F5F9",
              border: "1px solid #E2E8F0",
              gap: 0.35,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button
              size="small"
              onClick={() => setFilterMode("last30")}
              sx={{
                flex: { xs: 1, sm: "initial" },
                borderRadius: "7px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.75rem",
                px: 1.3,
                py: 0.4,
                minHeight: 28,
                bgcolor: filterMode === "last30" ? "#0056D2" : "transparent",
                color: filterMode === "last30" ? "#ffffff" : "#475569",
                boxShadow: filterMode === "last30" ? "0 2px 6px rgba(0, 86, 210, 0.25)" : "none",
                "&:hover": {
                  bgcolor: filterMode === "last30" ? "#0047B3" : "rgba(0,0,0,0.04)",
                },
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              Últimos 30 días
            </Button>
            <Button
              size="small"
              onClick={() => setFilterMode("custom")}
              sx={{
                flex: { xs: 1, sm: "initial" },
                borderRadius: "7px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.75rem",
                px: 1.3,
                py: 0.4,
                minHeight: 28,
                bgcolor: filterMode === "custom" ? "#0056D2" : "transparent",
                color: filterMode === "custom" ? "#ffffff" : "#475569",
                boxShadow: filterMode === "custom" ? "0 2px 6px rgba(0, 86, 210, 0.25)" : "none",
                "&:hover": {
                  bgcolor: filterMode === "custom" ? "#0047B3" : "rgba(0,0,0,0.04)",
                },
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              Personalizado
            </Button>
          </Box>

          {/* Botón más chico para ir a la tabla */}
          {onGoToTable && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onGoToTable({ dateFrom: activeDateRange.dateFrom, dateTo: activeDateRange.dateTo })}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
              sx={{
                flex: { xs: 1, sm: "initial" },
                width: { xs: "100%", sm: "auto" },
                height: 32,
                borderRadius: "9px",
                background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.78rem",
                px: 1.6,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0, 86, 210, 0.22)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0047B3 0%, #1e40af 100%)",
                  boxShadow: "0 4px 12px rgba(0, 86, 210, 0.3)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.15s ease",
              }}
            >
              Ver historial de movimientos
            </Button>
          )}
        </Box>
      </Box>

      {/* Rango de Fechas Personalizado: Desplegable con Desde y Hasta visibles */}
      <AnimatePresence>
        {filterMode === "custom" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 1.2,
                bgcolor: "#F8FAFC",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <CalendarMonthIcon sx={{ color: "#0056D2", fontSize: 18 }} />
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1E293B" }}>
                  Filtrar por rango específico
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1.5, sm: 2 },
                  flexWrap: "wrap",
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                {/* Selector 'Desde' */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flex: { xs: 1, sm: "initial" } }}>
                  <Typography
                    component="label"
                    htmlFor="filter-date-from"
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#334155",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Desde:
                  </Typography>
                  <TextField
                    id="filter-date-from"
                    size="small"
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    sx={{
                      bgcolor: "#FFFFFF",
                      borderRadius: "8px",
                      width: { xs: "100%", sm: 145 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        height: 32,
                      },
                    }}
                  />
                </Box>

                {/* Selector 'Hasta' */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flex: { xs: 1, sm: "initial" } }}>
                  <Typography
                    component="label"
                    htmlFor="filter-date-to"
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#334155",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Hasta:
                  </Typography>
                  <TextField
                    id="filter-date-to"
                    size="small"
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    sx={{
                      bgcolor: "#FFFFFF",
                      borderRadius: "8px",
                      width: { xs: "100%", sm: 145 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        height: 32,
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido: GRÁFICA A UN COSTADO (IZQUIERDA) Y DETALLES DE MOVIMIENTO A LA DERECHA */}
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        {conceptTransactions.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 1.2 }}>
            <CalendarMonthIcon sx={{ fontSize: 40, color: "#94A3B8" }} />
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
              No se encontraron movimientos con concepto registrado en este período.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setFilterMode("last30")}
              sx={{ borderRadius: "7px", textTransform: "none", color: "#0056D2", borderColor: "#CBD5E1", fontSize: "0.75rem", mt: 0.5 }}
            >
              Restablecer a Últimos 30 días
            </Button>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2.5, md: 3.5 }} sx={{ alignItems: "center", justifyContent: "center" }}>
            {/* LADO IZQUIERDO: LA GRÁFICA PERFECTAMENTE CENTRADA EN SU SECCIÓN */}
            <Grid
              size={{ xs: 12, md: 5, lg: 4.5 }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                my: "auto",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 230, sm: 250, md: 260 },
                  height: { xs: 230, sm: 250, md: 260 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  my: "auto",
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 220 220"
                  style={{
                    display: "block",
                    overflow: "visible",
                  }}
                >
                  <g transform="rotate(-90 110 110)">
                    {/* Anillo de fondo suave */}
                    <circle
                      cx="110"
                      cy="110"
                      r="80"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="32"
                    />

                    {/* Arcos de las porciones: fill="none" y pointerEvents="stroke" */}
                    {slices.map((slice, index) => {
                      const isHovered = hoveredSlice === index;
                      return (
                        <circle
                          key={slice.id}
                          cx="110"
                          cy="110"
                          r="80"
                          fill="none"
                          stroke={slice.color}
                          strokeWidth={isHovered ? 38 : 31}
                          strokeDasharray={slice.strokeDasharray}
                          strokeDashoffset={slice.strokeDashoffset}
                          style={{
                            pointerEvents: "stroke",
                            transition: "stroke-width 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease, filter 0.22s ease",
                            cursor: "pointer",
                            opacity: hoveredSlice !== null && !isHovered ? 0.42 : 1,
                            filter: isHovered ? `brightness(1.08) drop-shadow(0 0 8px ${slice.color}77)` : "none",
                          }}
                          onClick={() => handleCategoryClick(slice.name)}
                          onMouseEnter={() => setHoveredSlice(index)}
                          onMouseLeave={() => setHoveredSlice(null)}
                        />
                      );
                    })}
                  </g>
                </svg>

                {/* Centro Dinámico de la Pizza con 'Movimientos de la cuenta' y Total */}
                <Box
                  onMouseEnter={() => setHoveredSlice(null)}
                  onMouseMove={() => { if (hoveredSlice !== null) setHoveredSlice(null); }}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    px: 1.5,
                    width: "60%",
                    height: "60%",
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "auto",
                    cursor: "default",
                    userSelect: "none",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {activeSlice ? (
                      <motion.div
                        key={activeSlice.id}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.12 }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: activeSlice.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 110,
                          }}
                        >
                          {activeSlice.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "1.05rem", sm: "1.18rem" },
                            fontWeight: 900,
                            color: "#0f172a",
                            lineHeight: 1.15,
                            my: 0.2,
                          }}
                        >
                          ${activeSlice.total.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${activeSlice.percentage}%`}
                          sx={{
                            height: 18,
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            bgcolor: activeSlice.lightColor,
                            color: activeSlice.color,
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="total"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.66rem",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Movimientos de la cuenta
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "1.05rem", sm: "1.2rem" },
                            fontWeight: 900,
                            color: "#0f172a",
                            lineHeight: 1.15,
                            my: 0.2,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          ${totalSum.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </Typography>
                        <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600 }}>
                          {conceptTransactions.length} operaciones
                        </Typography>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </Box>
            </Grid>

            {/* LADO DERECHO: DETALLES DE MOVIMIENTO (Solo motivos/conceptos: Salud, Combustible, etc.) */}
            <Grid size={{ xs: 12, md: 7, lg: 7.5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: { xs: 0.5, sm: 0 },
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.01em" }}>
                    Detalles de movimiento
                  </Typography>
                  <Typography sx={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>
                    Hacé clic en un motivo para filtrar la tabla
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    },
                    gap: 1.2,
                  }}
                >
                  {slices.map((item, idx) => {
                    const isHovered = hoveredSlice === idx;
                    return (
                      <Tooltip
                        key={idx}
                        title={`Ver movimientos de ${item.name} en el historial`}
                        arrow
                        placement="top"
                      >
                        <Box
                          onClick={() => handleCategoryClick(item.name)}
                          onMouseEnter={() => setHoveredSlice(idx)}
                          onMouseLeave={() => setHoveredSlice(null)}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            p: { xs: 1.3, sm: 1.4, md: 1.3, lg: 1.4 },
                            borderRadius: "14px",
                            bgcolor: "#ffffff",
                            border: "1.5px solid",
                            borderColor: isHovered ? item.color : "rgba(226, 232, 240, 0.9)",
                            boxShadow: isHovered
                              ? `0 8px 18px -4px ${item.color}30, 0 2px 6px rgba(0,0,0,0.03)`
                              : "0 2px 5px -1px rgba(15, 23, 42, 0.03)",
                            cursor: "pointer",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: isHovered ? "translateY(-2px)" : "none",
                            position: "relative",
                            overflow: "hidden",
                            gap: 1,
                            minHeight: { xs: "auto", md: 88 },
                          }}
                        >
                          {/* Acento superior con color al hover */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 3,
                              bgcolor: isHovered ? item.color : "transparent",
                              transition: "background-color 0.15s ease",
                            }}
                          />

                          {/* Fila 1: Indicador con halo + Nombre + Porcentaje */}
                          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.6 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0, flex: 1 }}>
                              <Box
                                sx={{
                                  width: 9,
                                  height: 9,
                                  borderRadius: "50%",
                                  bgcolor: item.color,
                                  flexShrink: 0,
                                  boxShadow: `0 0 0 2.5px ${item.lightColor}`,
                                }}
                              />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  sx={{
                                    fontSize: { xs: "0.82rem", sm: "0.84rem", md: "0.78rem", lg: "0.82rem" },
                                    fontWeight: 700,
                                    color: isHovered ? item.color : "#1e293b",
                                    lineHeight: 1.2,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    transition: "color 0.15s ease",
                                  }}
                                >
                                  {item.name}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              size="small"
                              label={`${item.percentage}%`}
                              sx={{
                                height: 18,
                                fontSize: "0.66rem",
                                fontWeight: 800,
                                bgcolor: item.lightColor,
                                color: item.color,
                                borderRadius: "5px",
                                px: 0.3,
                                flexShrink: 0,
                              }}
                            />
                          </Box>

                          {/* Fila 2: Monto Total + Acción / Contador */}
                          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mt: "auto" }}>
                            <Typography
                              sx={{
                                fontSize: { xs: "0.92rem", sm: "0.98rem", md: "0.88rem", lg: "0.95rem" },
                                fontWeight: 800,
                                color: "#0f172a",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              ${item.total.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: { xs: "0.68rem", color: "#94a3b8" },
                                color: isHovered ? item.color : "#94a3b8",
                                fontWeight: isHovered ? 700 : 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.2,
                                transition: "color 0.15s ease",
                              }}
                            >
                              {isHovered ? "Ver tabla →" : `${item.count} ops`}
                            </Typography>
                          </Box>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default MovementPieChart;
