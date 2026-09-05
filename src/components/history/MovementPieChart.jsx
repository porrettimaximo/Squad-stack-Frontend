import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import PieChartIcon from "@mui/icons-material/PieChart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const PALETTE = [
  { main: "#10b981", light: "rgba(16, 185, 129, 0.12)", border: "#059669" }, // Esmeralda / Ingresos
  { main: "#ef4444", light: "rgba(239, 68, 68, 0.12)", border: "#dc2626" },   // Carmín / Egresos
  { main: "#3b82f6", light: "rgba(59, 130, 246, 0.12)", border: "#2563eb" },   // Azul eléctrico / Depósitos
  { main: "#f59e0b", light: "rgba(245, 158, 11, 0.12)", border: "#d97706" },   // Ámbar
  { main: "#8b5cf6", light: "rgba(139, 92, 246, 0.12)", border: "#7c3aed" },   // Violeta
  { main: "#ec4899", light: "rgba(236, 72, 153, 0.12)", border: "#db2777" },   // Rosa
  { main: "#06b6d4", light: "rgba(6, 182, 212, 0.12)", border: "#0891b2" },    // Cyan
  { main: "#14b8a6", light: "rgba(20, 184, 166, 0.12)", border: "#0d9488" },   // Teal
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
}) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  // Modos de filtro: 'last30' (Últimos 30 días) o 'custom' (Personalizado)
  const [filterMode, setFilterMode] = useState("last30");

  // Fechas iniciales para el modo personalizado (por defecto últimos 30 días)
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

  // Rango activo de fechas según el modo seleccionado
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

    // Modo personalizado
    return {
      dateFrom: customDateFrom || "",
      dateTo: customDateTo || "",
      label: customDateFrom && customDateTo ? `${customDateFrom} a ${customDateTo}` : "Personalizado",
    };
  }, [filterMode, customDateFrom, customDateTo]);

  // Filtrado de transacciones según el rango activo
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const { dateFrom, dateTo } = activeDateRange;
    if (!dateFrom && !dateTo) return transactions;

    return transactions.filter((tx) => {
      const raw = tx.date || tx.rawDate;
      if (!raw) return true;
      const txDate = new Date(raw);
      if (isNaN(txDate.getTime())) return true;

      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`);
        if (txDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59.999`);
        if (txDate > to) return false;
      }
      return true;
    });
  }, [transactions, activeDateRange]);

  // Procesar datos para el gráfico Donut agrupado por concepto
  const chartData = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return [];

    const acc = {};
    filteredTransactions.forEach((tx) => {
      const amount = Math.abs(Number(tx.amount) || 0);
      const cat = tx.reason || tx.concept || tx.category || "Varios / General";
      if (!acc[cat]) {
        acc[cat] = { count: 0, total: 0 };
      }
      acc[cat].count += 1;
      acc[cat].total += amount;
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
  }, [filteredTransactions]);

  const totalSum = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.total, 0);
  }, [chartData]);

  // Construir arcos SVG interactivos para el gráfico Donut en gran escala
  const slices = useMemo(() => {
    if (totalSum === 0) return [];
    let cumulativePercent = 0;
    const radius = 95;
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

  // Manejador de clic en una categoría para saltar a la tabla con filtros precargados
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
        borderRadius: "24px",
        background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        boxShadow: "0 20px 40px -15px rgba(0, 86, 210, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
        position: "relative",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Luz decorativa de fondo (Glow Effect) */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 86, 210, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Cabecera: Total destacado a la izquierda + Botones de período y acceso a tabla a la derecha */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        {/* Total General Destacado (Reemplaza el título 'Distribución por concepto') */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
          <Box
            sx={{
              width: { xs: 46, sm: 50 },
              height: { xs: 46, sm: 50 },
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0056D2 0%, #2563eb 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 18px -4px rgba(0, 86, 210, 0.35)",
              flexShrink: 0,
            }}
          >
            <PieChartIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: "0.72rem", sm: "0.76rem" },
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Total {filterMode === "last30" ? "Últimos 30 días" : "Período Seleccionado"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap", mt: 0.2 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.45rem", sm: "1.75rem" },
                  color: "#0f172a",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                ${totalSum.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Typography>
              <Chip
                label={`${filteredTransactions.length} operaciones`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  bgcolor: "#EFF6FF",
                  color: "#0056D2",
                  borderRadius: "6px",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Acciones de Cabecera: Botones 'Últimos 30 días' y 'Personalizado' + Botón a la Tabla */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            width: { xs: "100%", md: "auto" },
          }}
        >
          {/* Selector Segmentado de 2 Botones */}
          <Box
            sx={{
              display: "flex",
              p: 0.5,
              borderRadius: "14px",
              bgcolor: "#F1F5F9",
              border: "1px solid #E2E8F0",
              gap: 0.5,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button
              size="small"
              onClick={() => setFilterMode("last30")}
              sx={{
                flex: { xs: 1, sm: "initial" },
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: { xs: "0.8rem", sm: "0.84rem" },
                px: { xs: 1.6, sm: 2.2 },
                py: 0.7,
                bgcolor: filterMode === "last30" ? "#0056D2" : "transparent",
                color: filterMode === "last30" ? "#ffffff" : "#475569",
                boxShadow: filterMode === "last30" ? "0 4px 12px rgba(0, 86, 210, 0.25)" : "none",
                "&:hover": {
                  bgcolor: filterMode === "last30" ? "#0047B3" : "rgba(0,0,0,0.04)",
                },
                transition: "all 0.2s ease",
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
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: { xs: "0.8rem", sm: "0.84rem" },
                px: { xs: 1.6, sm: 2.2 },
                py: 0.7,
                bgcolor: filterMode === "custom" ? "#0056D2" : "transparent",
                color: filterMode === "custom" ? "#ffffff" : "#475569",
                boxShadow: filterMode === "custom" ? "0 4px 12px rgba(0, 86, 210, 0.25)" : "none",
                "&:hover": {
                  bgcolor: filterMode === "custom" ? "#0047B3" : "rgba(0,0,0,0.04)",
                },
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              Personalizado
            </Button>
          </Box>

          {/* Botón para ir a la tabla con el rango activo */}
          {onGoToTable && (
            <Button
              variant="contained"
              onClick={() => onGoToTable({ dateFrom: activeDateRange.dateFrom, dateTo: activeDateRange.dateTo })}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              sx={{
                flex: { xs: 1, sm: "initial" },
                width: { xs: "100%", sm: "auto" },
                height: 40,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                px: { xs: 2, sm: 2.5 },
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(0, 86, 210, 0.25)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0047B3 0%, #1e40af 100%)",
                  boxShadow: "0 6px 18px rgba(0, 86, 210, 0.35)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Ver historial de movimientos
            </Button>
          )}
        </Box>
      </Box>

      {/* Rango de Fechas Personalizado: Aparece al apretar 'Personalizado' */}
      <AnimatePresence>
        {filterMode === "custom" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 1.6,
                bgcolor: "#F8FAFC",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarMonthIcon sx={{ color: "#0056D2", fontSize: 20 }} />
                <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: "#334155" }}>
                  Seleccionar fechas del período:
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  type="date"
                  label="Desde"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: "#FFFFFF", borderRadius: "10px", width: 165 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Hasta"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: "#FFFFFF", borderRadius: "10px", width: 165 }}
                />
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido: 1) SOLO EL GRÁFICO CENTRADO Y MÁS GRANDE */}
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {filteredTransactions.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
            <CalendarMonthIcon sx={{ fontSize: 48, color: "#94A3B8" }} />
            <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600 }}>
              No se encontraron movimientos registrados en este período.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setFilterMode("last30")}
              sx={{ borderRadius: "8px", textTransform: "none", color: "#0056D2", borderColor: "#CBD5E1", mt: 0.5 }}
            >
              Restablecer a Últimos 30 días
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* SECCIÓN 1: SOLO EL GRÁFICO (CENTRADO Y MÁS GRANDE) */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: { xs: 2, sm: 3, md: 4 },
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 280, sm: 340, md: 390, lg: 420 },
                  height: { xs: 280, sm: 340, md: 390, lg: 420 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 250 250"
                  style={{
                    transform: "rotate(-90deg)",
                    overflow: "visible",
                    filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.07))",
                  }}
                >
                  {/* Anillo de fondo suave */}
                  <circle
                    cx="125"
                    cy="125"
                    r="95"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="38"
                  />

                  {/* Arcos de las porciones */}
                  {slices.map((slice, index) => {
                    const isHovered = hoveredSlice === index;
                    return (
                      <circle
                        key={slice.id}
                        cx="125"
                        cy="125"
                        r="95"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 45 : 37}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        style={{
                          transition: "stroke-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, filter 0.25s ease",
                          cursor: "pointer",
                          opacity: hoveredSlice !== null && !isHovered ? 0.4 : 1,
                          filter: isHovered ? "brightness(1.08) drop-shadow(0 0 10px " + slice.color + "77)" : "none",
                        }}
                        onClick={() => handleCategoryClick(slice.name)}
                        onMouseEnter={() => setHoveredSlice(index)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })}
                </svg>

                {/* Centro Dinámico de la Pizza (Total y Detalle activo) */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                    px: 2,
                    width: "65%",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {activeSlice ? (
                      <motion.div
                        key={activeSlice.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.75rem", sm: "0.85rem" },
                            fontWeight: 800,
                            color: activeSlice.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {activeSlice.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "1.25rem", sm: "1.55rem", md: "1.75rem" },
                            fontWeight: 900,
                            color: "#0f172a",
                            lineHeight: 1.15,
                            my: 0.4,
                          }}
                        >
                          ${activeSlice.total.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${activeSlice.percentage}% del total`}
                          sx={{
                            height: 22,
                            fontSize: "0.74rem",
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
                        transition={{ duration: 0.2 }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.78rem" },
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          Volumen Total
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "1.45rem", sm: "1.85rem", md: "2.1rem" },
                            fontWeight: 900,
                            color: "#0f172a",
                            lineHeight: 1.15,
                            my: 0.3,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          ${totalSum.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem" }, color: "#94a3b8", fontWeight: 600 }}>
                          {filteredTransactions.length} operaciones
                        </Typography>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </Box>
            </Box>

            {/* SECCIÓN 2: ABAJO LOS DETALLES DE PARTICIPACIONES (4x2) */}
            <Box sx={{ borderTop: "1px solid #f1f5f9", pt: { xs: 2.5, sm: 3 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                  px: { xs: 0.5, sm: 0 },
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: "#1e293b" }}>
                  Detalle de participaciones:
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                  Hacé clic en una tarjeta para filtrar la tabla
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 1.5,
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
                          p: { xs: 1.5, sm: 1.6, md: 1.4, lg: 1.6 },
                          borderRadius: "16px",
                          bgcolor: "#ffffff",
                          border: "1.5px solid",
                          borderColor: isHovered ? item.color : "rgba(226, 232, 240, 0.9)",
                          boxShadow: isHovered
                            ? `0 12px 24px -4px ${item.color}35, 0 2px 6px rgba(0,0,0,0.04)`
                            : "0 2px 6px -1px rgba(15, 23, 42, 0.04)",
                          cursor: "pointer",
                          transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                          transform: isHovered ? "translateY(-2px)" : "none",
                          position: "relative",
                          overflow: "hidden",
                          gap: 1.2,
                          minHeight: { xs: "auto", md: 100 },
                        }}
                      >
                        {/* Acento superior sutil con color al hacer hover o estar activo */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3.5,
                            bgcolor: isHovered ? item.color : "transparent",
                            transition: "background-color 0.2s ease",
                          }}
                        />

                        {/* Fila 1: Indicador con halo + Nombre + Badge de Porcentaje */}
                        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.6 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: item.color,
                                flexShrink: 0,
                                boxShadow: `0 0 0 2.5px ${item.lightColor}`,
                              }}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: { xs: "0.84rem", sm: "0.86rem", md: "0.82rem", lg: "0.86rem" },
                                  fontWeight: 700,
                                  color: isHovered ? item.color : "#1e293b",
                                  lineHeight: 1.2,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  transition: "color 0.2s ease",
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
                              height: 20,
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              bgcolor: item.lightColor,
                              color: item.color,
                              borderRadius: "6px",
                              px: 0.4,
                              flexShrink: 0,
                            }}
                          />
                        </Box>

                        {/* Fila 2: Monto Total + Acción / Contador */}
                        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mt: "auto" }}>
                          <Typography
                            sx={{
                              fontSize: { xs: "1rem", sm: "1.05rem", md: "0.95rem", lg: "1.05rem" },
                              fontWeight: 800,
                              color: "#0f172a",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            ${item.total.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: { xs: "0.72rem", md: "0.7rem", lg: "0.75rem" },
                              color: isHovered ? item.color : "#94a3b8",
                              fontWeight: isHovered ? 700 : 500,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.3,
                              transition: "color 0.2s ease",
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
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MovementPieChart;
