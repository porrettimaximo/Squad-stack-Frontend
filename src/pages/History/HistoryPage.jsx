import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import SyncIcon from "@mui/icons-material/Sync";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { motion, AnimatePresence } from "framer-motion";

import AppLayout from "../../components/layout/AppLayout";
import { useAccount } from "../../hooks/useAccount";
import { useAuth } from "../../context/AuthContext";
import transactionService from "../../services/transactionService";
import { formatCurrency, formatTransactionDate } from "../../utils/formatters";
import MovementPieChart from "../../components/history/MovementPieChart";
import TransferReceiptModal from "../../components/common/TransferReceiptModal";
import { findContact } from "../../constants/contacts";

/**
 * HU-27: Pantalla de Historial con filtros y paginación.
 * Tabla de Material UI conectada al endpoint de transacciones con soporte offline reactivo.
 */
export function HistoryPage() {
  const { account, transactions: localTransactions } = useAccount();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("chart"); // 'chart' | 'table'

  const handleGoToTableWithFilter = ({ dateFrom: filterDateFrom, dateTo: filterDateTo } = {}) => {
    setSearch("");
    if (filterDateFrom !== undefined) setDateFrom(filterDateFrom || "");
    if (filterDateTo !== undefined) setDateTo(filterDateTo || "");
    setTypeFilter("all");
    setPage(1);
    setViewMode("table");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = ({ concept, dateFrom: filterDateFrom, dateTo: filterDateTo }) => {
    setSearch(concept || "");
    setDateFrom(filterDateFrom || "");
    setDateTo(filterDateTo || "");
    setTypeFilter("all");
    setPage(1);
    setViewMode("table");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToChart = () => {
    setViewMode("chart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
  const [allChartTransactions, setAllChartTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado del modal de comprobante
  const [selectedTx, setSelectedTx] = useState(null);

  // Mapeo completo de datos para el Comprobante y descarga en PDF
  const selectedTxReceiptData = useMemo(() => {
    if (!selectedTx) return null;

    const myAccId = account?.id ? String(account.id) : (user?.id ? String(user.id) : "4");
    const mySeed = findContact(myAccId) || findContact(user?.id) || findContact(user?.email);
    const myEmail = user?.email || mySeed?.email || `usuario${myAccId}@digitalars.com`;
    const myName = mySeed?.name || (myEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()));
    const myUsername = myEmail.split("@")[0];

    const myProfileData = {
      name: myName,
      email: myEmail,
      accountId: myAccId,
      accountNumber: mySeed?.accountNumber || `0002-4892-0${myAccId}`,
      cvu: mySeed?.cvu || `000000310001000000000${myAccId}`,
      alias: mySeed?.alias || `${myUsername}.ars`,
      bank: mySeed?.bank || "DigitalArs Billetera Virtual",
    };

    // Contraparte
    const counterpartAccId = selectedTx.toAccountId
      ? String(selectedTx.toAccountId)
      : (selectedTx.accountId && String(selectedTx.accountId) !== myAccId ? String(selectedTx.accountId) : "2");

    const rawTitleName = selectedTx.title?.replace(/transferencia (enviada )?a /i, "").replace(/transferencia (recibida )?de /i, "").trim();
    const counterpartSeed = findContact(counterpartAccId) || findContact(selectedTx.counterpart) || findContact(rawTitleName);
    const counterpartName = counterpartSeed?.name || selectedTx.counterpart || rawTitleName || `Cuenta #${counterpartAccId}`;
    const counterpartEmail = counterpartSeed?.email || `cuenta${counterpartAccId}@digitalars.com`;
    const counterpartUsername = counterpartEmail.split("@")[0];

    const counterpartProfileData = {
      name: counterpartName,
      email: counterpartEmail,
      accountId: counterpartAccId,
      accountNumber: counterpartSeed?.accountNumber || `0002-4892-0${counterpartAccId}`,
      cvu: counterpartSeed?.cvu || `000000310001000000000${counterpartAccId}`,
      alias: counterpartSeed?.alias || `${counterpartUsername}.ars`,
      bank: counterpartSeed?.bank || "DigitalArs Billetera Virtual",
    };

    const isIncoming = selectedTx.type === 2 || selectedTx.isIncome;

    return {
      operationId: `TX-${String(selectedTx.id).padStart(4, "0")}`,
      date: selectedTx.formattedDate || formatTransactionDate(selectedTx.date || selectedTx.rawDate),
      amount: Number(selectedTx.amount) || 0,
      motive: selectedTx.concept || selectedTx.title || "Varios",
      origin: isIncoming ? counterpartProfileData : myProfileData,
      destination: isIncoming ? myProfileData : counterpartProfileData,
      status: selectedTx.status || "Operación Exitosa",
    };
  }, [selectedTx, account, user]);

  // Carga todas las transacciones sin paginar para alimentar la gráfica de motivos
  const loadChartData = useCallback(async () => {
    try {
      const res = await transactionService.getHistory({
        page: 1,
        pageSize: 100,
        localTransactions,
      });
      if (res?.items) {
        setAllChartTransactions(res.items);
      }
    } catch {
      // Ignorar error si está offline
    }
  }, [localTransactions]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

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

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadChartData(), loadHistory()]);
    } finally {
      setLoading(false);
    }
  }, [loadChartData, loadHistory]);

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
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Transacciones a usar para el gráfico (prioriza la lista completa de la cuenta)
  const chartTxSource = allChartTransactions.length > 0 
    ? allChartTransactions 
    : (localTransactions.length > 0 ? localTransactions : items);

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
        {/* ─── VISTAS CONDICIONALES CON ANIMACIÓN FLUIDA: GRÁFICO O TABLA ─── */}
        <AnimatePresence mode="wait">
          {viewMode === "chart" ? (
            <motion.div
              key="chart-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              style={{ width: "100%" }}
            >
              <MovementPieChart
                transactions={chartTxSource}
                onGoToTable={handleGoToTableWithFilter}
                onSelectCategory={handleSelectCategory}
                onRefresh={handleRefresh}
                loading={loading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="table-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              style={{ width: "100%" }}
            >
              {/* Botón para volver al Gráfico */}
              <Box sx={{ mb: 2.5, display: "flex", alignItems: "center" }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackToChart}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    borderColor: "#CBD5E1",
                    color: "#0056D2",
                    bgcolor: "#FFFFFF",
                    px: 2.5,
                    py: 0.9,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                    "&:hover": {
                      borderColor: "#0056D2",
                      bgcolor: "#EEF4FF",
                    },
                  }}
                >
                  Volver al Gráfico
                </Button>
              </Box>

              {/* ─── BARRA DE FILTROS ─── */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: "14px", sm: "16px" },
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                mb: 2.5,
                boxShadow: "0 2px 10px -2px rgba(15, 23, 42, 0.03)",
              }}
            >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "1.4fr 1.15fr 1fr 1fr auto" },
              gap: 1.5,
              alignItems: "flex-end",
            }}
          >
            {/* 1. Búsqueda por concepto */}
            <Box sx={{ gridColumn: { xs: "span 2", md: "span 1" }, display: "flex", flexDirection: "column", gap: 0.5 }}>
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
            <Box sx={{ gridColumn: { xs: "span 2", md: "span 1" }, display: "flex", flexDirection: "column", gap: 0.5 }}>
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
                  <MenuItem value="income">Ingresos</MenuItem>
                  <MenuItem value="expense">Egresos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* 3. Fecha Desde */}
            <Box sx={{ gridColumn: { xs: "span 1", md: "span 1" }, display: "flex", flexDirection: "column", gap: 0.5 }}>
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
            <Box sx={{ gridColumn: { xs: "span 1", md: "span 1" }, display: "flex", flexDirection: "column", gap: 0.5 }}>
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

            {/* 5. Botones Limpiar y Actualizar */}
            <Box
              sx={{
                gridColumn: { xs: "span 2", md: "span 1" },
                display: "flex",
                gap: 1,
                justifyContent: "flex-end",
                width: { xs: "100%", md: "auto" },
              }}
            >
              <Tooltip title="Restablecer todos los filtros">
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={handleClearFilters}
                  sx={{
                    flex: 1,
                    height: 40,
                    borderRadius: "10px",
                    borderColor: "#CBD5E1",
                    color: "#475569",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    px: 1.8,
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "#F8FAFC", borderColor: "#94A3B8" },
                  }}
                >
                  Limpiar
                </Button>
              </Tooltip>

              <Tooltip title="Actualizar datos desde el servidor">
                <Button
                  variant="contained"
                  disabled={loading}
                  startIcon={
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
                  }
                  onClick={handleRefresh}
                  sx={{
                    flex: 1,
                    height: 40,
                    borderRadius: "10px",
                    bgcolor: "#0056D2",
                    color: "#FFFFFF",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    px: 1.8,
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "#0047B3" },
                  }}
                >
                  Actualizar
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* ─── TABLA DE MATERIAL UI ─── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: "14px", sm: "20px" },
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
              {/* ─── VISTA ESCRITORIO: TABLA COMPLETA (md en adelante) ─── */}
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <TableContainer sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
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
                        const isIncome = tx.type === 1 || tx.type === 2 || tx.isIncome || tx.category === "INGRESO" || tx.category === "DEPÓSITO";

                        const icon = isIncome ? (
                          <SouthWestIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <NorthEastIcon sx={{ fontSize: 18 }} />
                        );
                        const iconBg = isIncome ? "#DCFCE7" : "#FEE2E2";
                        const iconColor = isIncome ? "#16A34A" : "#DC2626";
                        const chipLabel = isIncome ? "INGRESO" : "EGRESO";
                        const chipBg = isIncome ? "#DCFCE7" : "#FEE2E2";
                        const chipColor = isIncome ? "#15803D" : "#B91C1C";

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
                                    {(tx.subtitle || tx.category || "").replace("DEPÓSITO", "INGRESO")}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* 2. Contraparte / Destinatario */}
                            <TableCell sx={{ color: "#334155", fontSize: "0.85rem", fontWeight: 600 }}>
                              {counterpartDisplay}
                            </TableCell>

                            {/* 3. Tipo (Chip) */}
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

                            {/* 4. Fecha */}
                            <TableCell sx={{ color: "#475569", fontSize: "0.85rem", fontWeight: 500 }}>
                              {tx.formattedDate || formatTransactionDate(tx.date || tx.rawDate)}
                            </TableCell>

                            {/* 5. Estado */}
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

                            {/* 6. Monto */}
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

                            {/* 7. Botón Ver Detalle */}
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
              </Box>

              {/* ─── VISTA MÓVIL: TARJETAS TOUCH-FRIENDLY (xs y sm) ─── */}
              <Box sx={{ display: { xs: "block", md: "none" }, p: { xs: 1.2, sm: 2 } }}>
                {items.map((tx) => {
                  const isIncome = tx.type === 1 || tx.type === 2 || tx.isIncome || tx.category === "INGRESO" || tx.category === "DEPÓSITO";
                  const icon = isIncome ? <SouthWestIcon sx={{ fontSize: 18 }} /> : <NorthEastIcon sx={{ fontSize: 18 }} />;
                  const iconBg = isIncome ? "#DCFCE7" : "#FEE2E2";
                  const iconColor = isIncome ? "#16A34A" : "#DC2626";
                  const chipLabel = isIncome ? "INGRESO" : "EGRESO";
                  const chipBg = isIncome ? "#DCFCE7" : "#FEE2E2";
                  const chipColor = isIncome ? "#15803D" : "#B91C1C";
                  const counterpartDisplay = tx.counterpart || (tx.toAccountId ? `Cuenta #${tx.toAccountId}` : "Cuenta Propia");

                  return (
                    <Paper
                      key={tx.id}
                      elevation={0}
                      onClick={() => setSelectedTx(tx)}
                      sx={{
                        p: 1.5,
                        mb: 1.2,
                        borderRadius: "14px",
                        border: "1px solid #E2E8F0",
                        bgcolor: "#FFFFFF",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: "#CBD5E1",
                          bgcolor: "#FAFAFA",
                        },
                        "&:active": {
                          bgcolor: "#F1F5F9",
                          transform: "scale(0.99)",
                        },
                        "&:last-child": {
                          mb: 0,
                        },
                      }}
                    >
                      {/* Fila Superior: Avatar + Título/Motivo + Monto */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0, flex: 1 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: iconBg,
                              color: iconColor,
                              flexShrink: 0,
                            }}
                          >
                            {icon}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.88rem",
                                color: "#0F172A",
                                lineHeight: 1.2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {tx.title}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.74rem",
                                color: "#64748B",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                mt: 0.2,
                              }}
                            >
                              {(tx.subtitle || tx.category || "").replace("DEPÓSITO", "INGRESO")}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.95rem",
                              color: isIncome ? "#16A34A" : "#0F172A",
                              lineHeight: 1.2,
                            }}
                          >
                            {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Fila Inferior: Contraparte + Fecha + Chips + Flecha */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mt: 1.2,
                          pt: 1,
                          borderTop: "1px dashed #F1F5F9",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: "0.74rem",
                              color: "#475569",
                              fontWeight: 600,
                              maxWidth: { xs: 130, sm: 200 },
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {counterpartDisplay}
                          </Typography>
                          <Typography sx={{ fontSize: "0.7rem", color: "#CBD5E1" }}>•</Typography>
                          <Typography sx={{ fontSize: "0.73rem", color: "#64748B", fontWeight: 500 }}>
                            {tx.formattedDate || formatTransactionDate(tx.date || tx.rawDate)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexShrink: 0 }}>
                          <Chip
                            label={chipLabel}
                            size="small"
                            sx={{
                              bgcolor: chipBg,
                              color: chipColor,
                              fontWeight: 800,
                              fontSize: "0.66rem",
                              height: 19,
                              borderRadius: "6px",
                              px: 0.2,
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              color: "#0056D2",
                              bgcolor: "#EFF6FF",
                              borderRadius: "6px",
                              p: 0.2,
                            }}
                          >
                            <ChevronRightIcon sx={{ fontSize: 16 }} />
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>

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
                    fontSize: { xs: "0.78rem", sm: "0.85rem" },
                    fontWeight: 600,
                  },
                  "& .MuiTablePagination-toolbar": {
                    flexWrap: "wrap",
                    justifyContent: { xs: "center", sm: "flex-end" },
                    gap: { xs: 0.5, sm: 0 },
                    p: { xs: 1, sm: 2 },
                  },
                }}
              />
            </>
          )}
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── MODAL REUTILIZABLE DE COMPROBANTE CON TODA LA INFORMACIÓN Y DESCARGA EN PDF ─── */}
        <TransferReceiptModal
          open={Boolean(selectedTx)}
          onClose={() => setSelectedTx(null)}
          transferData={selectedTxReceiptData}
        />
      </Box>
    </AppLayout>
  );
}

export default HistoryPage;
