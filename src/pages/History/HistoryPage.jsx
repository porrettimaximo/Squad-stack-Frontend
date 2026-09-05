import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Avatar,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import { motion } from "framer-motion";

import AppLayout from "../../components/layout/AppLayout";
import { useAccount } from "../../hooks/useAccount";
import transactionService from "../../services/transactionService";
import { formatCurrency, formatTransactionDate } from "../../utils/formatters";

/**
 * HU-27: Pantalla de Historial con filtros y paginación.
 * Tabla de Material UI conectada al endpoint de transacciones con soporte offline reactivo.
 */
export function HistoryPage() {
  const { transactions: localTransactions } = useAccount();

  // Estados de filtros
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  // Estados de paginación
  const [page, setPage] = useState(1); // 1-based para la API
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Estados de datos y carga
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carga de historial desde la API o fallback local
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionService.getHistory({
        page,
        pageSize,
        type: typeFilter,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        search,
        localTransactions,
      });

      if (res) {
        setItems(res.items || []);
        setTotalItems(res.totalItems ?? 0);
      }
    } catch (err) {
      console.warn("Error cargando historial de transacciones:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, typeFilter, dateFrom, dateTo, search, localTransactions]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClearFilters = () => {
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setPage(1);
  };

  const handlePageChange = (event, newPageZeroBased) => {
    setPage(newPageZeroBased + 1);
  };

  const handleRowsPerPageChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <AppLayout maxWidth={1180}>
      <Box sx={{ width: "100%" }}>
        {/* Cabecera de la Sección */}
        <Box sx={{ mb: 3.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                bgcolor: "#EEF4FF",
                color: "#0056D2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ReceiptLongOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0F172A", fontSize: { xs: "1.6rem", md: "2rem" } }}>
              Historial de Movimientos
            </Typography>
          </Box>
          <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>
            Explorá tus transacciones, depósitos y transferencias con filtros avanzados y paginación.
          </Typography>
        </Box>

        {/* ─── BARRA DE FILTROS ─── */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "18px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            mb: 3,
            boxShadow: "0 4px 15px -3px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <FilterListIcon sx={{ color: "#0056D2", fontSize: 20 }} />
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>
              Filtros de búsqueda
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1.2fr 1fr 1fr auto", md: "1.4fr 1.2fr 1fr 1fr auto" },
              gap: 2,
              alignItems: "center",
            }}
          >
            {/* 1. Búsqueda por concepto */}
            <TextField
              size="small"
              placeholder="Buscar por concepto..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: "12px", bgcolor: "#F8FAFC", fontSize: "0.9rem" },
              }}
            />

            {/* 2. Tipo de movimiento */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="type-filter-label">Tipo de Movimiento</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                label="Tipo de Movimiento"
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                sx={{ borderRadius: "12px", bgcolor: "#F8FAFC", fontSize: "0.9rem" }}
              >
                <MenuItem value="all">Todos los tipos</MenuItem>
                <MenuItem value="1">Depósitos</MenuItem>
                <MenuItem value="2">Ingresos / Recibidos</MenuItem>
                <MenuItem value="3">Egresos / Transferencias</MenuItem>
              </Select>
            </FormControl>

            {/* 3. Fecha Desde */}
            <TextField
              size="small"
              type="date"
              label="Desde"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: { borderRadius: "12px", bgcolor: "#F8FAFC", fontSize: "0.85rem" },
              }}
            />

            {/* 4. Fecha Hasta */}
            <TextField
              size="small"
              type="date"
              label="Hasta"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: { borderRadius: "12px", bgcolor: "#F8FAFC", fontSize: "0.85rem" },
              }}
            />

            {/* 5. Botón Limpiar */}
            <Tooltip title="Restablecer todos los filtros">
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleClearFilters}
                sx={{
                  borderRadius: "12px",
                  borderColor: "#CBD5E1",
                  color: "#475569",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  py: 0.9,
                  "&:hover": { bgcolor: "#F8FAFC", borderColor: "#94A3B8" },
                }}
              >
                Limpiar
              </Button>
            </Tooltip>
          </Box>
        </Paper>

        {/* ─── TABLA DE MATERIAL UI ─── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            boxShadow: "0 8px 30px -10px rgba(15, 23, 42, 0.06)",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
              <CircularProgress size={36} sx={{ color: "#0056D2" }} />
            </Box>
          ) : items.length === 0 ? (
            /* ─── ESTADO VACÍO EXPLÍCITO (Criterio de Aceptación) ─── */
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                px: 3,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  bgcolor: "#F1F5F9",
                  color: "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <ReceiptLongOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 0.5 }}>
                No se encontraron movimientos
              </Typography>
              <Typography sx={{ color: "#64748B", fontSize: "0.9rem", maxWidth: 420, mb: 2.5 }}>
                No hay operaciones que coincidan con los filtros seleccionados. Probá modificando el tipo de movimiento o el rango de fechas.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleClearFilters}
                sx={{
                  borderRadius: "12px",
                  borderColor: "#0056D2",
                  color: "#0056D2",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                Restablecer filtros
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.8rem", textTransform: "uppercase" }}>
                        Operación / Concepto
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.8rem", textTransform: "uppercase" }}>
                        Tipo
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.8rem", textTransform: "uppercase" }}>
                        Fecha
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.8rem", textTransform: "uppercase" }}>
                        Monto
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((tx) => {
                      const isIncome = tx.type === 1 || tx.type === 2;

                      let icon = <NorthEastIcon sx={{ fontSize: 18 }} />;
                      let iconBg = "#FEE2E2";
                      let iconColor = "#DC2626";
                      let chipLabel = "EGRESO";
                      let chipBg = "#FEE2E2";
                      let chipColor = "#B91C1C";

                      if (tx.type === 1) {
                        icon = <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />;
                        iconBg = "#E0F2FE";
                        iconColor = "#0284C7";
                        chipLabel = "DEPÓSITO";
                        chipBg = "#E0F2FE";
                        chipColor = "#0369A1";
                      } else if (tx.type === 2) {
                        icon = <SouthWestIcon sx={{ fontSize: 18 }} />;
                        iconBg = "#DCFCE7";
                        iconColor = "#16A34A";
                        chipLabel = "INGRESO";
                        chipBg = "#DCFCE7";
                        chipColor = "#15803D";
                      }

                      return (
                        <TableRow
                          key={tx.id}
                          hover
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          {/* Concepto y Avatar */}
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 38,
                                  height: 38,
                                  bgcolor: iconBg,
                                  color: iconColor,
                                }}
                              >
                                {icon}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#0F172A" }}>
                                  {tx.title}
                                </Typography>
                                <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }}>
                                  {tx.toAccountId ? `Hacia cuenta #${tx.toAccountId}` : "Operación directa"}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Tipo (Chip) */}
                          <TableCell>
                            <Chip
                              label={chipLabel}
                              size="small"
                              sx={{
                                bgcolor: chipBg,
                                color: chipColor,
                                fontWeight: 800,
                                fontSize: "0.72rem",
                                borderRadius: "8px",
                              }}
                            />
                          </TableCell>

                          {/* Fecha */}
                          <TableCell sx={{ color: "#475569", fontSize: "0.85rem", fontWeight: 500 }}>
                            {tx.formattedDate || formatTransactionDate(tx.date || tx.rawDate)}
                          </TableCell>

                          {/* Monto */}
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.95rem",
                                color: isIncome ? "#16A34A" : "#0F172A",
                              }}
                            >
                              {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* ─── PAGINACIÓN DE MATERIAL UI (Criterio de Aceptación) ─── */}
              <TablePagination
                component="div"
                count={totalItems}
                page={Math.max(0, page - 1)}
                rowsPerPage={pageSize}
                rowsPerPageOptions={[5, 10, 25]}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
                sx={{
                  borderTop: "1px solid #E2E8F0",
                  color: "#64748B",
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  },
                }}
              />
            </>
          )}
        </Paper>
      </Box>
    </AppLayout>
  );
}

export default HistoryPage;
