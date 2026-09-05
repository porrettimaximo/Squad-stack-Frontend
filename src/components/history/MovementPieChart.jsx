import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
} from "@mui/material";
import PieChartIcon from "@mui/icons-material/PieChart";

const PALETTE = [
  "#22c55e", // Verde (Ingresos)
  "#ef4444", // Rojo (Egresos)
  "#3b82f6", // Azul (Depósitos)
  "#f59e0b", // Ámbar / Naranja
  "#8b5cf6", // Violeta
  "#ec4899", // Rosa
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
];

export const MovementPieChart = ({ transactions = [] }) => {
  const [viewMode, setViewMode] = useState("TYPE"); // 'TYPE' | 'CATEGORY'

  // Procesar datos para el gráfico según el modo seleccionado
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    if (viewMode === "TYPE") {
      const acc = {
        Ingresos: { label: "Ingresos / Cobros", count: 0, total: 0, color: "#22c55e" },
        Egresos: { label: "Egresos / Pagos", count: 0, total: 0, color: "#ef4444" },
        Depósitos: { label: "Depósitos", count: 0, total: 0, color: "#3b82f6" },
      };

      transactions.forEach((tx) => {
        const amount = Math.abs(Number(tx.amount) || 0);
        const type = String(tx.type || tx.movementType || "").toUpperCase();
        if (type.includes("DEPOSIT") || type.includes("DEPÓSITO") || type.includes("DEPOSITO")) {
          acc["Depósitos"].count += 1;
          acc["Depósitos"].total += amount;
        } else if (
          type.includes("EGRESO") ||
          type.includes("OUT") ||
          type.includes("TRANSFER") ||
          type.includes("PAGO") ||
          (tx.direction && tx.direction === "OUT")
        ) {
          acc["Egresos"].count += 1;
          acc["Egresos"].total += amount;
        } else {
          acc["Ingresos"].count += 1;
          acc["Ingresos"].total += amount;
        }
      });

      return Object.entries(acc)
        .filter(([_, data]) => data.total > 0 || data.count > 0)
        .map(([name, data]) => ({
          name,
          label: data.label,
          count: data.count,
          total: data.total,
          color: data.color,
        }));
    } else {
      // Modo CATEGORY (por motivo o concepto)
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
        .map(([name, data], idx) => ({
          name,
          label: name,
          count: data.count,
          total: data.total,
          color: PALETTE[idx % PALETTE.length],
        }));
    }
  }, [transactions, viewMode]);

  const totalSum = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.total, 0);
  }, [chartData]);

  // Construir arcos SVG para el gráfico de Donut / Pizza
  const slices = useMemo(() => {
    if (totalSum === 0) return [];
    let cumulativePercent = 0;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;

    return chartData.map((item) => {
      const percentage = (item.total / totalSum) * 100;
      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulativePercent / 100) * circumference);
      cumulativePercent += percentage;

      return {
        ...item,
        percentage: percentage.toFixed(1),
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [chartData, totalSum]);

  return (
    <Card
      sx={{
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)",
        bgcolor: "#ffffff",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid #f1f5f9",
          bgcolor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PieChartIcon sx={{ color: "#3b82f6", fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>
            Distribución de Movimientos
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="pie-mode-label" sx={{ fontSize: "0.8rem" }}>
            Ver por
          </InputLabel>
          <Select
            labelId="pie-mode-label"
            value={viewMode}
            label="Ver por"
            onChange={(e) => setViewMode(e.target.value)}
            sx={{
              borderRadius: "10px",
              bgcolor: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: 600,
              height: 36,
            }}
          >
            <MenuItem value="TYPE" sx={{ fontSize: "0.82rem" }}>
              Por Tipo de Movimiento
            </MenuItem>
            <MenuItem value="CATEGORY" sx={{ fontSize: "0.82rem" }}>
              Por Motivo / Concepto
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        {chartData.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              No hay movimientos registrados para mostrar en el gráfico.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Donut SVG */}
            <Box sx={{ position: "relative", width: 170, height: 170, my: 1.5 }}>
              <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: "rotate(-90deg)" }}>
                {slices.map((slice, index) => (
                  <circle
                    key={index}
                    cx="85"
                    cy="85"
                    r="60"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="26"
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    style={{
                      transition: "stroke-dashoffset 0.6s ease, stroke-dasharray 0.6s ease",
                    }}
                  />
                ))}
              </svg>
              {/* Centro de la dona */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                  px: 1,
                }}
              >
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
                  Volumen
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                  $${totalSum.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8", mt: 0.2 }}>
                  {transactions.length} ops
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ width: "100%", my: 2 }} />

            {/* Desglose / Leyendas */}
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.2 }}>
              {slices.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    borderRadius: "8px",
                    bgcolor: "#f8fafc",
                    "&:hover": { bgcolor: "#f1f5f9" },
                    transition: "background-color 0.2s",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 130,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>
                        {item.count} {item.count === 1 ? "movimiento" : "movimientos"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: "#0f172a" }}>
                      $${item.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${item.percentage}%`}
                      sx={{
                        height: 18,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        bgcolor: `${item.color}15`,
                        color: item.color,
                        mt: 0.3,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MovementPieChart;
