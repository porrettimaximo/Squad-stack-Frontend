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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";

import AppLayout from "../../components/layout/AppLayout";
import { useAccount } from "../../hooks/useAccount";
import transactionService from "../../services/transactionService";
import { formatCurrency, formatTransactionDate } from "../../utils/formatters";
import MovementPieChart from "../../components/history/MovementPieChart";

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

  // Estado del modal de comprobante
  const [selectedTx, setSelectedTx] = useState(null);
  const [copied, setCopied] = useState(false);


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

  const handleCopyId = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`TX-${String(id).padStart(4, "0")}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppLayout maxWidth={1380} showNavbarTabs={false}>
      <Box sx={{ width: "100%" }}>
        {/* Cabecera de la Sección */}
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: "#EEF4FF",
              color: "#0056D2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ReceiptLongOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#0F172A",
                fontSize: { xs: "1.35rem", md: "1.7rem" },
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Historial de Movimientos
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>
              Explorá todas tus operaciones, transferencias y depósitos.
            </Typography>
          </Box>
        </Box>

        {/* ─── CONTENIDO PRINCIPAL: 2 COLUMNAS (PIZZA IZQUIERDA, TABLA DERECHA) ─── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "340px 1fr" },
            gap: 2.5,
            alignItems: "flex-start",
          }}
        >
          {/* Columna Izquierda: Gráfico de Pizza con Desplegable */}
          <Box sx={{ width: "100%", position: { lg: "sticky" }, top: { lg: 20 } }}>
            <MovementPieChart transactions={localTransactions && localTransactions.length > 0 ? localTransactions : (items.length > 0 ? items : [])} />
          </Box>

          {/* Columna Derecha: Filtros y Tabla */}
          <Box sx={{ width: "100%", minWidth: 0 }}>
            {/* ─── BARRA DE FILTROS ─── */}
            <Paper
              elevation={0}
              sx={{
                p: 1.8,
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                mb: 2.5,
                boxShadow: "0 2px 10px -2px rgba(15, 23, 42, 0.03)",
              }}
            >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1.4fr 1.15fr 1fr 1fr auto" },
              gap: 1.5,
              alignItems: "flex-end",
            }}
          >
            {/* 1. Búsqueda por concepto */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B" }}>
                Concepto / Operación
              </Typography>
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
                  sx: { borderRadius: "10px", bgcolor: "#F8FAFC", fontSize: "0.88rem", height: 40 },
                }}
              />
            </Box>

            {/* 2. Tipo de movimiento */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B" }}>
                Tipo de Movimiento
              </Typography>
              <FormControl size="small">
                <Select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  sx={{ borderRadius: "10px", bgcolor: "#F8FAFC", fontSize: "0.88rem", height: 40 }}
                >
                  <MenuItem value="all">Todos los tipos</MenuItem>
                  <MenuItem value="1">Depósitos</MenuItem>
                  <MenuItem value="2">Ingresos / Recibidos</MenuItem>
                  <MenuItem value="3">Egresos / Transferencias</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* 3. Fecha Desde */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B" }}>
                Desde
              </Typography>
              <TextField
                size="small"
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                InputProps={{
                  sx: { borderRadius: "10px", bgcolor: "#F8FAFC", fontSize: "0.85rem", height: 40 },
                }}
              />
            </Box>

            {/* 4. Fecha Hasta */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B" }}>
                Hasta
              </Typography>
              <TextField
                size="small"
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                InputProps={{
                  sx: { borderRadius: "10px", bgcolor: "#F8FAFC", fontSize: "0.85rem", height: 40 },
                }}
              />
            </Box>

            {/* 5. Botón Limpiar */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, justifyContent: "flex-end" }}>
              <Tooltip title="Restablecer todos los filtros">
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={handleClearFilters}
                  sx={{
                    height: 40,
                    borderRadius: "10px",
                    borderColor: "#CBD5E1",
                    color: "#475569",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    px: 2,
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "#F8FAFC", borderColor: "#94A3B8" },
                  }}
                >
                  Limpiar
                </Button>
              </Tooltip>
            </Box>
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
                <Table sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.78rem", textTransform: "uppercase" }}>
                        Operación / Concepto
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.78rem", textTransform: "uppercase" }}>
                        Destinatario / Contraparte
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.78rem", textTransform: "uppercase" }}>
                        Tipo
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.78rem", textTransform: "uppercase" }}>
                        Fecha
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.78rem", textTransform: "uppercase" }}>
                        Estado
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.78rem", textTransform: "uppercase" }}>
                        Monto
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#64748B", fontSize: "0.78rem", textTransform: "uppercase" }}>
                        Detalle
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

                      const txCode = `TX-${String(tx.id).padStart(4, "0")}`;
                      const counterpartDisplay =
                        tx.counterpart ||
                        (tx.toAccountId ? `Cuenta #${tx.toAccountId}` : "Cuenta Propia");

                      return (
                        <TableRow
                          key={tx.id}
                          hover
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                          }}
                          onClick={() => setSelectedTx(tx)}
                        >
                          {/* 1. Operación y Concepto */}
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
                                  {tx.subtitle || tx.category}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* 3. Contraparte / Destinatario */}
                          <TableCell sx={{ color: "#334155", fontSize: "0.85rem", fontWeight: 600 }}>
                            {counterpartDisplay}
                          </TableCell>

                          {/* 4. Tipo (Chip) */}
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

                          {/* 5. Fecha */}
                          <TableCell sx={{ color: "#475569", fontSize: "0.85rem", fontWeight: 500 }}>
                            {tx.formattedDate || formatTransactionDate(tx.date || tx.rawDate)}
                          </TableCell>

                          {/* 6. Estado */}
                          <TableCell>
                            <Chip
                              icon={<CheckCircleOutlinedIcon sx={{ fontSize: "14px !important", color: "#16A34A !important" }} />}
                              label={tx.status || "Completada"}
                              size="small"
                              sx={{
                                bgcolor: "#DCFCE7",
                                color: "#15803D",
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                borderRadius: "8px",
                              }}
                            />
                          </TableCell>

                          {/* 7. Monto */}
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

                          {/* 8. Botón Ver Detalle */}
                          <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="Ver comprobante digital">
                              <IconButton
                                size="small"
                                onClick={() => setSelectedTx(tx)}
                                sx={{
                                  color: "#0056D2",
                                  bgcolor: "#EEF4FF",
                                  "&:hover": { bgcolor: "#D9E8FF" },
                                }}
                              >
                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
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
        </Box>

        {/* ─── MODAL DE COMPROBANTE DIGITAL ─── */}
        {selectedTx && (
          <Dialog
            open={Boolean(selectedTx)}
            onClose={() => setSelectedTx(null)}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: "20px",
                p: 1,
              },
            }}
          >
            <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ReceiptLongOutlinedIcon sx={{ color: "#0056D2" }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem" }}>
                  Comprobante Digital
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedTx(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              {/* Badge de Monto */}
              <Box sx={{ textAlign: "center", my: 1 }}>
                <Chip
                  icon={<CheckCircleOutlinedIcon sx={{ fontSize: "16px !important", color: "#16A34A !important" }} />}
                  label="Operación Exitosa"
                  size="small"
                  sx={{ bgcolor: "#DCFCE7", color: "#15803D", fontWeight: 700, mb: 1 }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: selectedTx.type === 1 || selectedTx.type === 2 ? "#16A34A" : "#0F172A",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {selectedTx.type === 1 || selectedTx.type === 2 ? "+" : "-"}
                  {formatCurrency(selectedTx.amount)}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
                  {selectedTx.title}
                </Typography>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Fila: ID Transacción */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Número de Operación
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace", color: "#0F172A" }}>
                    TX-{String(selectedTx.id).padStart(4, "0")}
                  </Typography>
                  <Tooltip title={copied ? "¡Copiado!" : "Copiar ID"}>
                    <IconButton size="small" onClick={() => handleCopyId(selectedTx.id)}>
                      <ContentCopyIcon sx={{ fontSize: 14, color: copied ? "#16A34A" : "#64748B" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Fila: Fecha y Hora */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Fecha y Hora
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                  {selectedTx.formattedDate || formatTransactionDate(selectedTx.date || selectedTx.rawDate)}
                </Typography>
              </Box>

              {/* Fila: Tipo */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Tipo de Operación
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0056D2" }}>
                  {selectedTx.type === 1
                    ? "Depósito de Fondos"
                    : selectedTx.type === 2
                    ? "Transferencia Recibida"
                    : "Transferencia Enviada"}
                </Typography>
              </Box>

              {/* Fila: Contraparte / Destino */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Contraparte / Destinatario
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {selectedTx.counterpart || (selectedTx.toAccountId ? `Cuenta #${selectedTx.toAccountId}` : "Cuenta Propia")}
                </Typography>
              </Box>

              {/* Fila: Estado */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Estado
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#16A34A" }}>
                  {selectedTx.status || "Completada"}
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setSelectedTx(null)}
                sx={{
                  bgcolor: "#0056D2",
                  borderRadius: "12px",
                  py: 1,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0047B3" },
                }}
              >
                Cerrar comprobante
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </AppLayout>
  );
}

export default HistoryPage;
