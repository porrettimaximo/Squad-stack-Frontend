import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { transactionService } from "../../services/transactionService";

export function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Paginación (MUI maneja base 0, el backend .NET espera base 1)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Filtros (HU-17)
  const [filters, setFilters] = useState({
    type: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
  });

  // Filtros aplicados que disparan la petición
  const [appliedFilters, setAppliedFilters] = useState({});

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page: page + 1,
        pageSize: rowsPerPage,
        ...appliedFilters,
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const data = await transactionService.getMyHistory(params);

      if (data) {
        setTransactions(data.items || []);
        setTotalItems(data.totalItems || 0);
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
      setError(
        err.response?.data?.error ||
          "No se pudo conectar con el servicio de historial. Verifica que la API esté corriendo en http://localhost:5065"
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, appliedFilters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(0); // Volver a la primera página al filtrar
    setAppliedFilters({ ...filters });
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      type: "",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters({});
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderTypeChip = (type) => {
    switch (type) {
      case 1:
        return (
          <Chip
            size="small"
            icon={<ArrowDownwardIcon fontSize="small" />}
            label="Depósito"
            color="success"
            variant="outlined"
          />
        );
      case 2:
        return (
          <Chip
            size="small"
            icon={<ArrowDownwardIcon fontSize="small" />}
            label="Transf. Recibida"
            color="primary"
            variant="outlined"
          />
        );
      case 3:
        return (
          <Chip
            size="small"
            icon={<ArrowUpwardIcon fontSize="small" />}
            label="Transf. Enviada"
            color="error"
            variant="outlined"
          />
        );
      default:
        return <Chip size="small" label={`Tipo #${type}`} />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="primary">
          Historial de Movimientos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consulta y filtra todos los movimientos de tu cuenta bancaria (HU-17).
        </Typography>
      </Box>

      {/* Alerta de Error si la API no está disponible */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Panel de Filtros */}
      <Card sx={{ mb: 4, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <FilterListIcon /> Filtros de Búsqueda
          </Typography>

          <Box component="form" onSubmit={handleApplyFilters}>
            <Grid container spacing={2}>
              {/* Filtro por Tipo */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipo de Movimiento"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="1">1 - Depósito</MenuItem>
                  <MenuItem value="2">2 - Transferencia Recibida</MenuItem>
                  <MenuItem value="3">3 - Transferencia Enviada</MenuItem>
                </TextField>
              </Grid>

              {/* Filtro Fecha Desde */}
              <Grid item xs={12} sm={6} md={2.25}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Fecha Desde"
                  InputLabelProps={{ shrink: true }}
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </Grid>

              {/* Filtro Fecha Hasta */}
              <Grid item xs={12} sm={6} md={2.25}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Fecha Hasta"
                  InputLabelProps={{ shrink: true }}
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </Grid>

              {/* Filtro Monto Mínimo */}
              <Grid item xs={12} sm={6} md={2.25}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Monto Mínimo"
                  placeholder="0.00"
                  value={filters.amountMin}
                  onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                />
              </Grid>

              {/* Filtro Monto Máximo */}
              <Grid item xs={12} sm={6} md={2.25}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Monto Máximo"
                  placeholder="0.00"
                  value={filters.amountMax}
                  onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                />
              </Grid>

              {/* Botones de Acción */}
              <Grid item xs={12} sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 1 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetFilters}
                >
                  Limpiar
                </Button>
                <Button variant="contained" color="primary" type="submit" startIcon={<FilterListIcon />}>
                  Aplicar Filtros
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de Resultados */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Cargando movimientos...
              </Typography>
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                No se encontraron movimientos registrados con los filtros seleccionados.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Concepto</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Cuenta Relacionada</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      Monto
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>#{tx.id}</TableCell>
                      <TableCell>{renderTypeChip(tx.type)}</TableCell>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                      <TableCell>{tx.concept || "-"}</TableCell>
                      <TableCell>
                        {tx.toAccountId ? `Cuenta #${tx.toAccountId}` : "-"}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color: tx.type === 1 || tx.type === 2 ? "success.main" : "error.main",
                        }}
                      >
                        {tx.type === 1 || tx.type === 2 ? "+ " : "- "}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Paginación conectada con metadata del backend */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default HistoryPage;
