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

      {/* Cabecera de la Tarjeta con Título y Botón hacia la Tabla */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 2.5 },
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

        <Box sx={{ display: "flex", alignItems: "center", width: { xs: "100%", sm: "auto" } }}>
          {/* Botón para ver la tabla completa de historial */}
          {onGoToTable && (
            <Button
              variant="contained"
              onClick={onGoToTable}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              fullWidth
              sx={{
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

      {/* Contenido Principal con el Gráfico y los Datos */}
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {chartData.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="body1" sx={{ color: "#94a3b8", fontWeight: 600 }}>
              No hay transacciones registradas para analizar en el gráfico.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
            {/* Lado Izquierdo: Pizza / Donut SVG Interactivo */}
            <Grid item xs={12} md={5} sx={{ display: "flex", justifyContent: "center", position: "relative", my: { xs: 1, md: 0 } }}>
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
                        onClick={() => setHoveredSlice(prev => prev === index ? null : index)}
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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 0.5, sm: 0 } }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155" }}>
                    Detalle de participaciones:
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                    {slices.length} {slices.length === 1 ? "concepto" : "conceptos"}
                  </Typography>
                </Box>

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
                        onClick={() => setHoveredSlice(prev => prev === idx ? null : idx)}
                        onMouseEnter={() => setHoveredSlice(idx)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          p: { xs: 1.5, sm: 1.8 },
                          borderRadius: "16px",
                          bgcolor: isHovered ? "#ffffff" : "#ffffff",
                          border: "1.5px solid",
                          borderColor: isHovered ? item.color : "rgba(226, 232, 240, 0.9)",
                          boxShadow: isHovered
                            ? `0 10px 24px -4px ${item.color}35, 0 2px 8px rgba(0,0,0,0.04)`
                            : "0 2px 6px -1px rgba(15, 23, 42, 0.04)",
                          cursor: "pointer",
                          transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                          transform: isHovered ? "translateY(-2px)" : "none",
                          position: "relative",
                          overflow: "hidden",
                          gap: 1.4,
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
                        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                bgcolor: item.color,
                                flexShrink: 0,
                                boxShadow: `0 0 0 3px ${item.lightColor}`,
                              }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  lineHeight: 1.25,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: { xs: 180, sm: 130, md: 150 },
                                }}
                              >
                                {item.label}
                              </Typography>
                              <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500, mt: 0.2 }}>
                                {item.count} {item.count === 1 ? "movimiento" : "movimientos"}
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            size="small"
                            label={`${item.percentage}%`}
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              bgcolor: item.lightColor,
                              color: item.color,
                              borderRadius: "6px",
                              flexShrink: 0,
                            }}
                          />
                        </Box>

                        {/* Fila 2: Total acumulado + Barra de progreso visual */}
                        <Box sx={{ mt: "auto" }}>
                          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 0.8 }}>
                            <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                              Total
                            </Typography>
                            <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                              ${item.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </Typography>
                          </Box>

                          {/* Mini Barra de Progreso Visual */}
                          <Box sx={{ width: "100%", height: 5, bgcolor: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                            <Box
                              sx={{
                                width: `${Math.min(100, Math.max(4, item.percentage))}%`,
                                height: "100%",
                                bgcolor: item.color,
                                borderRadius: 3,
                                transition: "width 0.4s ease",
                              }}
                            />
                          </Box>
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
