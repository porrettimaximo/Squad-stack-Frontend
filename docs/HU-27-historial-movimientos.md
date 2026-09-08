# Documentación Técnica — HU-27: Historial con Filtros y Paginación

> **Proyecto:** DigitalArs — Billetera Virtual (Frontend)  
> **Historia de Usuario:** HU-27 — Historial con Filtros y Paginación  
> **Ubicación del Módulo:** `src/pages/History/HistoryPage.jsx` y servicio `src/services/transactionService.js`.

---

## 1. Objetivo y Criterios de Aceptación

> **Como usuario**, quiero explorar mi historial completo con filtros, para encontrar una operación puntual.

### Criterios Cumplidos:
- [x] **Tabla de Material UI con paginación conectada al backend:**
  - Estructura construida con componentes oficiales de MUI: `Table`, `TableHead`, `TableRow`, `TableCell`, `TableBody` y `TablePagination`.
  - Integrada con el endpoint `GET /api/transactions/me` enviando los parámetros de paginación y filtros.
  - Modo dual autónomo/offline para pruebas sin necesidad de backend activo.
- [x] **Filtros por tipo de movimiento y rango de fechas:**
  - **Tipo de movimiento:** Menú desplegable con opciones: *Todos los tipos*, *Depósitos (Tipo 1)*, *Ingresos / Transferencias Recibidas (Tipo 2)* y *Egresos / Transferencias Enviadas (Tipo 3)*.
  - **Rango de fechas:** Selectores nativos de fecha *Desde (`dateFrom`)* y *Hasta (`dateTo`)*.
  - **Búsqueda por texto:** Campo de búsqueda rápida con icono de lupa para filtrar por concepto o destinatario.
  - **Botón Limpiar:** Restablece todos los filtros aplicados a su estado inicial.
- [x] **Estado vacío explícito cuando no hay resultados:**
  - Cuando no existen movimientos que cumplan con los criterios de búsqueda, se muestra un contenedor centrado con icono temático (`ReceiptLongOutlinedIcon`), título explicativo (*"No se encontraron movimientos"*) y botón de acción para restablecer los filtros.
- [x] **La paginación refleja el `totalItems` de la API:**
  - `TablePagination` muestra el número de página actual, el selector de filas por página (`5`, `10`, `25`) y el texto descriptivo en español (*"1–10 de X"*).
  - El valor `count` refleja exactamente el campo `totalItems` retornado por la API (`PagedResultDto<TransactionItemDto>`).
- [x] **Diseño consistente con la aplicación:**
  - Integrado mediante `AppLayout`, manteniendo la barra lateral `Sidebar` (ítem *"Historial"* activo) y barra inferior móvil `MobileBottomNav`.
  - Chips de color por categoría (Celeste para Depósitos, Verde para Ingresos, Rojo para Egresos).
  - Montos formateados con `formatCurrency` en pesos argentinos.

---

## 2. Arquitectura de Componentes

```
HistoryPage.jsx (Montado en AppLayout)
├── Cabecera de Página (Icono + Título + Subtítulo)
├── Barra de Filtros (Paper)
│   ├── Buscador por concepto (TextField + SearchIcon)
│   ├── Selector de Tipo (FormControl + Select)
│   ├── Selector Fecha Desde (TextField type="date")
│   ├── Selector Fecha Hasta (TextField type="date")
│   └── Botón Limpiar (Button + RestartAltIcon)
├── Contenedor de Resultados (Paper)
│   ├── Loading State (CircularProgress)
│   ├── Empty State (Ilustración + Texto + Botón Restablecer)
│   └── Tabla Material UI (TableContainer)
│       ├── TableHead (Columnas: Operación, Tipo, Fecha, Monto)
│       ├── TableBody (Filas con avatar temático, Chip de tipo y monto en color)
│       └── TablePagination (Control de páginas y tamaño conectado a totalItems)
```

---

## 3. Endpoints y Contratos de Datos

- **Endpoint:** `GET /api/transactions/me`
- **Parámetros Query:**
  - `page`: Número de página (1-based, default 1).
  - `pageSize`: Cantidad de registros por página (default 10).
  - `type`: Opcional (1 = Deposit, 2 = TransferIn, 3 = TransferOut).
  - `dateFrom`: Opcional (ISO Date `YYYY-MM-DD`).
  - `dateTo`: Opcional (ISO Date `YYYY-MM-DD`).
- **Respuesta:** `PagedResultDto<TransactionItemDto>`:
  - `items`: Lista de transacciones del usuario.
  - `page`: Página actual.
  - `pageSize`: Tamaño de página.
  - `totalItems`: Total de movimientos encontrados.
  - `totalPages`: Total de páginas calculadas.
