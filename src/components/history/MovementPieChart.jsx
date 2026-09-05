import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
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

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

export const MovementPieChart = ({
  transactions = [],
  onGoToTable,
  onSelectCategory,
}) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  // Opciones dinámicas de meses (Mes actual + 5 meses previos + Todos + Personalizado)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const curName = capitalize(now.toLocaleDateString("es-AR", { month: "long" }));

    options.push({
      key: "current",
      label: `${curName} ${curYear} (Este mes)`,
    });

    for (let i = 1; i <= 5; i++) {
      const d = new Date(curYear, curMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const name = capitalize(d.toLocaleDateString("es-AR", { month: "long" }));
      const key = `${y}-${String(m + 1).padStart(2, "0")}`;
      options.push({
        key,
        label: `${name} ${y}`,
      });
    }

    options.push({
      key: "all",
      label: "Todos los meses / Histórico",
    });

    options.push({
      key: "custom",
      label: "Personalizado (Rango de fechas)...",
    });

    return options;
  }, []);

  // Rango activo de fechas según el período seleccionado
  const activeDateRange = useMemo(() => {
    const now = new Date();
    if (selectedPeriod === "current") {
      const year = now.getFullYear();
      const month = now.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      const mStr = String(month + 1).padStart(2, "0");
      return {
        dateFrom: `${year}-${mStr}-01`,
        dateTo: `${year}-${mStr}-${String(lastDay).padStart(2, "0")}`,
        label: `${capitalize(now.toLocaleDateString("es-AR", { month: "long" }))} ${year}`,
      };
    }
    if (selectedPeriod === "all") {
      return {
        dateFrom: "",
        dateTo: "",
        label: "Histórico Total",
      };
    }
    if (selectedPeriod === "custom") {
      return {
        dateFrom: customDateFrom,
        dateTo: customDateTo,
        label: customDateFrom && customDateTo ? `${customDateFrom} a ${customDateTo}` : "Personalizado",
      };
    }

    // Formato "YYYY-MM"
    const [yStr, mStr] = selectedPeriod.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    const d = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0).getDate();
    const name = capitalize(d.toLocaleDateString("es-AR", { month: "long" }));
    return {
      dateFrom: `${y}-${mStr}-01`,
      dateTo: `${y}-${mStr}-${String(lastDay).padStart(2, "0")}`,
      label: `${name} ${y}`,
    };
  }, [selectedPeriod, customDateFrom, customDateTo]);

  // Filtrado de transacciones según el período activo
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    if (selectedPeriod === "all") return transactions;

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
  }, [transactions, selectedPeriod, activeDateRange]);

  // Procesar datos para el gráfico Donut por concepto
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

  // Construir arcos SVG interactivos para el gráfico de Pizza Donut
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

  // Manejador al hacer clic en una categoría
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
          top: -80,
          right: -80,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 86, 210, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Cabecera de la Tarjeta con Título, Selector de Mes y Botón hacia la Tabla */}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0056D2 0%, #2563eb 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px -4px rgba(0, 86, 210, 0.35)",
              flexShrink: 0,
            }}
          >
            <PieChartIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.02rem", sm: "1.1rem" }, color: "#0f172a", letterSpacing: "-0.01em" }}>
                Distribución por Concepto
              </Typography>
              <Chip
                label="Por Concepto"
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  bgcolor: "#EFF6FF",
                  color: "#0056D2",
                  borderRadius: "6px",
                }}
              />
            </Box>
            <Typography sx={{ color: "#64748b", fontSize: { xs: "0.76rem", sm: "0.82rem" }, mt: 0.2 }}>
              Visualización gráfica de operaciones agrupadas por motivo y concepto
            </Typography>
          </Box>
        </Box>

        {/* Acciones de Cabecera: Selector de Mes y Botón a la Tabla */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            width: { xs: "100%", md: "auto" },
          }}
        >
          {/* Selector de Mes */}
          <FormControl size="small" sx={{ flex: { xs: 1, sm: "initial" }, minWidth: { xs: "100%", sm: 220 } }}>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              startAdornment={
                <InputAdornment position="start" sx={{ ml: 0.5, mr: -0.2 }}>
                  <CalendarMonthIcon sx={{ color: "#0056D2", fontSize: 19 }} />
                </InputAdornment>
              }
              sx={{
                height: 42,
                borderRadius: "12px",
                bgcolor: "#F8FAFC",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#1E293B",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E2E8F0",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0056D2",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0056D2",
                },
              }}
            >
              {monthOptions.map((opt) => (
                <MenuItem
                  key={opt.key}
                  value={opt.key}
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: opt.key === "current" ? 700 : 500,
                    color: opt.key === "current" ? "#0056D2" : "#1E293B",
                  }}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Botón para ver la tabla completa de historial */}
          {onGoToTable && (
            <Button
              variant="contained"
              onClick={() => onGoToTable({ dateFrom: activeDateRange.dateFrom, dateTo: activeDateRange.dateTo })}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              sx={{
                flex: { xs: 1, sm: "initial" },
                width: { xs: "100%", sm: "auto" },
                height: 42,
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

      {/* Rango de Fechas Personalizado (Desplegable animado si elige "Personalizado") */}
      <AnimatePresence>
        {selectedPeriod === "custom" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 1.5,
                bgcolor: "#F8FAFC",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569" }}>
                Filtrar por rango específico:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  type="date"
                  label="Desde"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: "#FFFFFF", borderRadius: "10px", width: 160 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Hasta"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: "#FFFFFF", borderRadius: "10px", width: 160 }}
                />
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido Principal con el Gráfico y los Datos */}
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {filteredTransactions.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
            <CalendarMonthIcon sx={{ fontSize: 44, color: "#94A3B8" }} />
            <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600 }}>
              No se encontraron movimientos registrados en este período.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSelectedPeriod("all")}
              sx={{ borderRadius: "8px", textTransform: "none", color: "#0056D2", borderColor: "#CBD5E1", mt: 0.5 }}
            >
              Ver todos los meses
            </Button>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
            {/* Lado Izquierdo: Pizza / Donut SVG Interactivo */}
            <Grid item xs={12} lg={3.8} xl={3.5} sx={{ display: "flex", justifyContent: "center", position: "relative", my: { xs: 1, lg: 0 } }}>
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 210, sm: 250, md: 260 },
                  height: { xs: 210, sm: 250, md: 260 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 220 220"
                  style={{
                    transform: "rotate(-90deg)",
                    overflow: "visible",
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.06))",
                  }}
                >
                  {/* Anillo de fondo suave */}
                  <circle
                    cx="110"
                    cy="110"
                    r="80"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="32"
                  />

                  {/* Arcos de las porciones */}
                  {slices.map((slice, index) => {
                    const isHovered = hoveredSlice === index;
                    return (
                      <circle
                        key={slice.id}
                        cx="110"
                        cy="110"
                        r="80"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 36 : 30}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        style={{
                          transition: "stroke-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, filter 0.25s ease",
                          cursor: "pointer",
                          opacity: hoveredSlice !== null && !isHovered ? 0.45 : 1,
                          filter: isHovered ? "brightness(1.08) drop-shadow(0 0 8px " + slice.color + "66)" : "none",
                        }}
                        onClick={() => handleCategoryClick(slice.name)}
                        onMouseEnter={() => setHoveredSlice(index)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })}
                </svg>

                {/* Centro Dinámico de la Pizza */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                    px: 1.5,
                    width: "60%",
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
                            fontSize: "0.72rem",
                            fontWeight: 700,
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
                            fontSize: { xs: "1.05rem", sm: "1.2rem" },
                            fontWeight: 900,
                            color: "#0f172a",
                            lineHeight: 1.2,
                            my: 0.3,
                          }}
                        >
                          ${activeSlice.total.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${activeSlice.percentage}% del total`}
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
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
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {selectedPeriod === "current"
                            ? "Volumen Este Mes"
                            : selectedPeriod === "all"
                            ? "Volumen Total"
                            : `Volumen ${activeDateRange.label}`}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "1.1rem", sm: "1.25rem" },
                            fontWeight: 900,
                            color: "#0f172a",
                            lineHeight: 1.2,
                            my: 0.2,
                          }}
                        >
                          ${totalSum.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600 }}>
                          {filteredTransactions.length} operaciones
                        </Typography>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </Box>
            </Grid>

            {/* Lado Derecho: Tarjetas / Leyendas con desglose interactivo en 4x2 */}
            <Grid item xs={12} lg={8.2} xl={8.5}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 0.5, sm: 0 }, flexWrap: "wrap", gap: 1 }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155" }}>
                    Detalle de participaciones:
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
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
                            p: { xs: 1.4, sm: 1.5, md: 1.2, lg: 1.4 },
                            borderRadius: "14px",
                            bgcolor: "#ffffff",
                            border: "1.5px solid",
                            borderColor: isHovered ? item.color : "rgba(226, 232, 240, 0.9)",
                            boxShadow: isHovered
                              ? `0 10px 22px -4px ${item.color}35, 0 2px 6px rgba(0,0,0,0.04)`
                              : "0 2px 6px -1px rgba(15, 23, 42, 0.04)",
                            cursor: "pointer",
                            transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform: isHovered ? "translateY(-2px)" : "none",
                            position: "relative",
                            overflow: "hidden",
                            gap: 1.1,
                            minHeight: { xs: "auto", md: 96 },
                          }}
                        >
                          {/* Acento superior sutil con color al hacer hover o estar activo */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 3,
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
                                    fontSize: { xs: "0.82rem", sm: "0.84rem", md: "0.78rem", lg: "0.82rem" },
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
                                height: 19,
                                fontSize: "0.66rem",
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
                                fontSize: { xs: "0.95rem", sm: "1rem", md: "0.9rem", lg: "0.98rem" },
                                fontWeight: 800,
                                color: "#0f172a",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              ${item.total.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: { xs: "0.7rem", md: "0.68rem", lg: "0.72rem" },
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
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default MovementPieChart;
