import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import PieChartIcon from "@mui/icons-material/PieChart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

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

export const MovementPieChart = ({ transactions = [], onGoToTable }) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Procesar datos para el gráfico fijo exclusivamente por motivo / concepto
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const acc = {};
    transactions.forEach((tx) => {
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
  }, [transactions]);

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

      {/* Cabecera de la Tarjeta con Título, Selector y Botón hacia la Tabla */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0056D2 0%, #2563eb 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px -4px rgba(0, 86, 210, 0.35)",
            }}
          >
            <PieChartIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", letterSpacing: "-0.01em" }}>
                Distribución por Concepto
              </Typography>
              <Chip
                label="Por Concepto"
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
            <Typography sx={{ color: "#64748b", fontSize: "0.82rem" }}>
              Visualización gráfica de operaciones agrupadas por motivo y concepto
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          {/* Botón para ver la tabla completa de historial */}
          {onGoToTable && (
            <Button
              variant="contained"
              onClick={onGoToTable}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              sx={{
                height: 40,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0056D2 0%, #1d4ed8 100%)",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                px: 2.2,
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

      {/* Contenido Principal con el Gráfico y los Datos */}
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        {chartData.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="body1" sx={{ color: "#94a3b8", fontWeight: 600 }}>
              No hay transacciones registradas para analizar en el gráfico.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
            {/* Lado Izquierdo: Pizza / Donut SVG Interactivo */}
            <Grid item xs={12} md={5} sx={{ display: "flex", justifyContent: "center", position: "relative" }}>
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 220, sm: 260 },
                  height: { xs: 220, sm: 260 },
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
                          Volumen Total
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
                          {transactions.length} operaciones
                        </Typography>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </Box>
            </Grid>

            {/* Lado Derecho: Tarjetas / Leyendas con desglose interactivo */}
            <Grid item xs={12} md={7}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", mb: 0.5 }}>
                  Detalle de participaciones:
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  {slices.map((item, idx) => {
                    const isHovered = hoveredSlice === idx;
                    return (
                      <Box
                        key={idx}
                        onMouseEnter={() => setHoveredSlice(idx)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1.6,
                          borderRadius: "14px",
                          bgcolor: isHovered ? "#ffffff" : "#f8fafc",
                          border: "1.5px solid",
                          borderColor: isHovered ? item.color : "#e2e8f0",
                          boxShadow: isHovered
                            ? "0 8px 20px -4px " + item.color + "33"
                            : "0 2px 6px rgba(0,0,0,0.02)",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          transform: isHovered ? "translateY(-2px)" : "none",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: "4px",
                              bgcolor: item.color,
                              flexShrink: 0,
                              boxShadow: "0 2px 4px " + item.color + "66",
                            }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: "0.84rem",
                                fontWeight: 700,
                                color: "#1e293b",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 140,
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>
                              {item.count} {item.count === 1 ? "movimiento" : "movimientos"}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ textAlign: "right", ml: 1, flexShrink: 0 }}>
                          <Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                            ${item.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${item.percentage}%`}
                            sx={{
                              height: 18,
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              bgcolor: item.lightColor,
                              color: item.color,
                              mt: 0.4,
                            }}
                          />
                        </Box>
                      </Box>
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
