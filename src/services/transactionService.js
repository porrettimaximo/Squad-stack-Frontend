import api from "./api";

/**
 * Normaliza y deduce el motivo / concepto oficial de la transacción.
 */
function resolveMotive(tx) {
  const concept = (tx.concept || "").trim();
  const lower = concept.toLowerCase();

  if (!concept) {
    if (tx.type === 1) return "Depósito de Fondos";
    if (tx.type === 2) return "Transferencia Recibida";
    return "Varios";
  }

  // Si incluye un motivo después de un separador (ej: "Transferencia recibida · Salud")
  if (concept.includes("·")) {
    const parts = concept.split("·");
    const lastPart = parts[parts.length - 1].trim();
    if (lastPart) return lastPart;
  }

  // Identificar motivos comerciales clave
  if (lower.includes("comida") || lower.includes("alimento") || lower.includes("starbucks")) return "Comidas y bebidas";
  if (lower.includes("servicio") || lower.includes("edenor") || lower.includes("luz") || lower.includes("gas") || lower.includes("agua") || lower.includes("spotify") || lower.includes("netflix")) return "Cuentas y servicios";
  if (lower.includes("salud") || lower.includes("farmacity") || lower.includes("medico") || lower.includes("médico") || lower.includes("farmacia")) return "Salud";
  if (lower.includes("combustible") || lower.includes("ypf") || lower.includes("shell") || lower.includes("nafta")) return "Transporte";
  if (lower.includes("compra") || lower.includes("coto") || lower.includes("mercado") || lower.includes("super")) return "Compras";
  if (lower.includes("transporte") || lower.includes("uber") || lower.includes("cabify") || lower.includes("sube")) return "Transporte";
  if (lower.includes("educacion") || lower.includes("educación") || lower.includes("curso")) return "Educación";
  if (lower.includes("entretenimiento") || lower.includes("cine")) return "Entretenimiento y cultura";
  if (lower.includes("viaje") || lower.includes("hotel") || lower.includes("vuelo")) return "Viajes";
  if (lower.includes("mascota") || lower.includes("veterinaria")) return "Mascotas";
  if (lower.includes("regalo")) return "Regalos";
  if (lower.includes("seguro")) return "Seguros";
  if (lower.includes("vivienda") || lower.includes("alquiler") || lower.includes("expensa")) return "Vivienda";
  if (lower.includes("honorario")) return "Honorarios profesionales";
  if (lower.includes("haber") || lower.includes("sueldo") || lower.includes("bono") || lower.includes("nómina")) return "Haberes";
  if (lower.includes("ahorro") || lower.includes("depósito") || lower.includes("deposito")) return "Depósitos y ahorro";

  // Si la transacción es una transferencia con destinatario/origen específico (ej: "Transferencia enviada a Roberto Carlos")
  if (lower.startsWith("transferencia")) {
    // Si menciona un contacto o cuenta, lo dejamos categorizado con el destinatario o Varios
    const match = concept.match(/(?:a|de)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ\s]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return "Familia y amigos";
  }

  return concept;
}

export const transactionService = {
  /**
   * Obtiene los últimos movimientos de la cuenta (HU-17).
   * GET /api/transactions/me?page=1&pageSize=5
   */
  async getRecentTransactions(pageSize = 5) {
    try {
      const response = await api.get("/transactions/me", {
        params: { page: 1, pageSize },
      });

      if (response.data?.items) {
        return response.data.items.map((tx) => {
          const isIncome = tx.type === 1 || tx.type === 2;
          const categoryName = tx.type === 1 ? "DEPÓSITO" : tx.type === 2 ? "INGRESO" : "EGRESO";
          const formattedDate = tx.date ? new Date(tx.date).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }) : "Reciente";

          let defaultTitle = "Movimiento";
          if (tx.type === 1) defaultTitle = "Depósito de Fondos";
          else if (tx.type === 2) defaultTitle = "Transferencia Recibida";
          else if (tx.type === 3) defaultTitle = `Transferencia a Cuenta #${tx.toAccountId || ""}`.trim();

          const motive = resolveMotive(tx);

          return {
            id: tx.id,
            title: tx.concept || defaultTitle,
            subtitle: `${formattedDate} · ${categoryName}`,
            type: tx.type,
            amount: tx.amount,
            category: categoryName,
            reason: motive,
            concept: motive,
            motive,
            isIncome,
            toAccountId: tx.toAccountId,
            date: tx.date,
          };
        });
      }

      const token = localStorage.getItem("token");
      if (token) return [];
      return this.getDemoTransactions().slice(0, pageSize);
    } catch {
      const token = localStorage.getItem("token");
      if (token) return [];
      return this.getDemoTransactions().slice(0, pageSize);
    }
  },

  /**
   * Obtiene el historial completo paginado de movimientos con filtros (HU-27).
   * GET /api/transactions/me?page=1&pageSize=10&type=...&dateFrom=...&dateTo=...
   */
  async getHistory({
    page = 1,
    pageSize = 10,
    type = null,
    dateFrom = null,
    dateTo = null,
    search = "",
    localTransactions = [],
  } = {}) {
    const params = { page, pageSize };
    if (type !== null && type !== "" && type !== "all") {
      params.type = type;
    }
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    try {
      const response = await api.get("/transactions/me", { params });
      if (response.data && Array.isArray(response.data.items)) {
        let items = response.data.items.map((tx) => {
          const isIncome = tx.type === 1 || tx.type === 2;
          const categoryName = tx.type === 1 ? "DEPÓSITO" : tx.type === 2 ? "INGRESO" : "EGRESO";
          const formattedDate = tx.date
            ? new Date(tx.date).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Reciente";

          let defaultTitle = "Movimiento";
          if (tx.type === 1) defaultTitle = "Depósito de Fondos";
          else if (tx.type === 2) defaultTitle = "Transferencia Recibida";
          else if (tx.type === 3) defaultTitle = `Transferencia a Cuenta #${tx.toAccountId || ""}`.trim();

          const motive = resolveMotive(tx);

          return {
            id: tx.id,
            title: tx.concept || defaultTitle,
            subtitle: `${formattedDate} · ${categoryName}`,
            rawDate: tx.date,
            formattedDate,
            type: tx.type,
            amount: tx.amount,
            category: categoryName,
            reason: motive,
            concept: motive,
            motive,
            isIncome,
            toAccountId: tx.toAccountId,
            counterpart: tx.toAccountId ? `Cuenta #${tx.toAccountId}` : "Directo",
            status: "Completada",
          };
        });


        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          items = items.filter(
            (item) =>
              item.title?.toLowerCase().includes(q) ||
              item.category?.toLowerCase().includes(q) ||
              item.subtitle?.toLowerCase().includes(q) ||
              item.counterpart?.toLowerCase().includes(q)
          );
        }

        return {
          items,
          page: response.data.page || page,
          pageSize: response.data.pageSize || pageSize,
          totalItems: response.data.totalItems ?? items.length,
          totalPages: response.data.totalPages || Math.ceil((response.data.totalItems ?? items.length) / pageSize),
        };
      }
    } catch {
      // Fallback a filtrado en memoria solo si no hay sesión
    }

    const token = localStorage.getItem("token");
    if (token) {
      return {
        items: localTransactions.length > 0 ? localTransactions : [],
        page,
        pageSize,
        totalItems: localTransactions.length,
        totalPages: Math.max(1, Math.ceil(localTransactions.length / pageSize)),
      };
    }

    // Modo autónomo / memoria con historial completo únicamente sin sesión
    let pool = localTransactions.length > 0 ? [...localTransactions] : this.getDemoTransactions();

    if (type !== null && type !== "" && type !== "all") {
      if (type === "income" || type === "ingreso" || type === 1 || type === 2 || type === "1" || type === "2") {
        pool = pool.filter((t) => t.type === 1 || t.type === 2 || t.isIncome);
      } else if (type === "expense" || type === "egreso" || type === 3 || type === "3") {
        pool = pool.filter((t) => t.type === 3 || (!t.isIncome && t.type !== 1 && t.type !== 2));
      } else {
        pool = pool.filter((t) => t.type === Number(type));
      }
    }

    if (dateFrom) {
      const from = new Date(dateFrom.includes("T") ? dateFrom : `${dateFrom}T00:00:00`);
      pool = pool.filter((t) => (t.date ? new Date(t.date) >= from : true));
    }

    if (dateTo) {
      const to = new Date(dateTo.includes("T") ? dateTo : `${dateTo}T23:59:59.999`);
      pool = pool.filter((t) => (t.date ? new Date(t.date) <= to : true));
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      pool = pool.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.concept?.toLowerCase().includes(q) ||
          t.reason?.toLowerCase().includes(q) ||
          t.subtitle?.toLowerCase().includes(q) ||
          t.counterpart?.toLowerCase().includes(q)
      );
    }

    const totalItems = pool.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const start = (page - 1) * pageSize;
    const pagedItems = pool.slice(start, start + pageSize);

    return {
      items: pagedItems,
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  },

  /**
   * Realiza una transferencia a otra cuenta (HU-16).
   * POST /api/transactions/transfer
   * Body: { destinationAccountId, amount }
   */
  async transfer({ destination, destinationAccountId, amount, concept }) {
    const destId = destinationAccountId || destination;
    const response = await api.post("/transactions/transfer", {
      destinationAccountId: Number(destId),
      amount: Number(amount),
      concept: concept || null,
    });
    return response.data;
  },

  /**
   * Historial completo de demostración con 20 transacciones realistas.
   */
  getDemoTransactions() {
    return [
      {
        id: 1,
        title: "Transferencia enviada a Roberto Carlos",
        subtitle: "03 Sep 18:40 · TRANSFERENCIAS",
        type: 3,
        amount: 15000.00,
        category: "TRANSFERENCIAS",
        date: "2026-09-03T18:40:00Z",
        toAccountId: "2",
        counterpart: "Roberto Carlos",
        status: "Completada",
      },
      {
        id: 2,
        title: "Transferencia recibida de Micaela Mulato",
        subtitle: "02 Sep 14:15 · TRANSFERENCIAS",
        type: 2,
        amount: 25000.00,
        category: "TRANSFERENCIAS",
        date: "2026-09-02T14:15:00Z",
        toAccountId: "4",
        counterpart: "Micaela Mulato",
        status: "Completada",
      },
      {
        id: 3,
        title: "Depósito de Fondos (CVU)",
        subtitle: "01 Sep 11:30 · DEPÓSITOS",
        type: 1,
        amount: 20000.00,
        category: "DEPÓSITOS",
        date: "2026-09-01T11:30:00Z",
        toAccountId: null,
        counterpart: "Cuenta Propia",
        status: "Completada",
      },
      {
        id: 4,
        title: "Netflix Suscripción",
        subtitle: "04 Sep 21:00 · SERVICIOS",
        type: 3,
        amount: 8500.00,
        category: "SERVICIOS",
        date: "2026-09-04T21:00:00Z",
        toAccountId: null,
        counterpart: "Netflix Argentina",
        status: "Completada",
      },
      {
        id: 5,
        title: "Transferencia recibida de Mohammed Khan",
        subtitle: "28 Ago 10:15 · TRANSFERENCIAS",
        type: 2,
        amount: 8500.00,
        category: "TRANSFERENCIAS",
        date: "2026-08-28T10:15:00Z",
        toAccountId: "4",
        counterpart: "Mohammed Khan",
        status: "Completada",
      },
      {
        id: 6,
        title: "Transferencia enviada a Emmanuel Torres",
        subtitle: "25 Ago 16:45 · TRANSFERENCIAS",
        type: 3,
        amount: 12000.00,
        category: "TRANSFERENCIAS",
        date: "2026-08-25T16:45:00Z",
        toAccountId: "6",
        counterpart: "Emmanuel Torres",
        status: "Completada",
      },
      {
        id: 7,
        title: "Mercado Libre",
        subtitle: "03 Sep 14:30 · COMPRAS",
        type: 3,
        amount: 1250.00,
        category: "COMPRAS",
        date: "2026-09-03T14:30:00Z",
        toAccountId: null,
        counterpart: "Mercado Libre S.R.L.",
        status: "Completada",
      },
      {
        id: 8,
        title: "Starbucks Café",
        subtitle: "02 Sep 08:30 · COMIDA",
        type: 3,
        amount: 850.00,
        category: "COMIDA",
        date: "2026-09-02T08:30:00Z",
        toAccountId: null,
        counterpart: "Starbucks Coffee",
        status: "Completada",
      },
      {
        id: 9,
        title: "Transferencia enviada a Micaela Mulato",
        subtitle: "20 Ago 12:00 · TRANSFERENCIAS",
        type: 3,
        amount: 5000.00,
        category: "TRANSFERENCIAS",
        date: "2026-08-20T12:00:00Z",
        toAccountId: "5",
        counterpart: "Micaela Mulato",
        status: "Completada",
      },
      {
        id: 10,
        title: "Depósito inicial de nómina",
        subtitle: "15 Ago 09:00 · DEPÓSITOS",
        type: 1,
        amount: 43730.50,
        category: "DEPÓSITOS",
        date: "2026-08-15T09:00:00Z",
        toAccountId: null,
        counterpart: "DigitalArs Pagos",
        status: "Completada",
      },
      {
        id: 11,
        title: "Pago de Servicios Edenor",
        subtitle: "12 Ago 17:20 · SERVICIOS",
        type: 3,
        amount: 14200.00,
        category: "SERVICIOS",
        date: "2026-08-12T17:20:00Z",
        toAccountId: null,
        counterpart: "Edenor S.A.",
        status: "Completada",
      },
      {
        id: 12,
        title: "Transferencia recibida de Emmanuel Torres",
        subtitle: "10 Ago 15:10 · TRANSFERENCIAS",
        type: 2,
        amount: 6000.00,
        category: "TRANSFERENCIAS",
        date: "2026-08-10T15:10:00Z",
        toAccountId: "4",
        counterpart: "Emmanuel Torres",
        status: "Completada",
      },
      {
        id: 13,
        title: "Carga de combustible YPF",
        subtitle: "02 Sep 19:40 · COMBUSTIBLE",
        type: 3,
        amount: 18500.00,
        category: "COMBUSTIBLE",
        date: "2026-09-02T19:40:00Z",
        toAccountId: null,
        counterpart: "YPF Estación Central",
        status: "Completada",
      },
      {
        id: 14,
        title: "Transferencia enviada a Roberto Carlos",
        subtitle: "05 Ago 13:25 · TRANSFERENCIAS",
        type: 3,
        amount: 10000.00,
        category: "TRANSFERENCIAS",
        date: "2026-08-05T13:25:00Z",
        toAccountId: "2",
        counterpart: "Roberto Carlos",
        status: "Completada",
      },
      {
        id: 15,
        title: "Depósito acreditación bono",
        subtitle: "01 Ago 10:00 · DEPÓSITOS",
        type: 1,
        amount: 30000.00,
        category: "DEPÓSITOS",
        date: "2026-08-01T10:00:00Z",
        toAccountId: null,
        counterpart: "Bono Desempeño",
        status: "Completada",
      },
      {
        id: 16,
        title: "Spotify Premium",
        subtitle: "28 Jul 03:15 · SERVICIOS",
        type: 3,
        amount: 2499.00,
        category: "SERVICIOS",
        date: "2026-07-28T03:15:00Z",
        toAccountId: null,
        counterpart: "Spotify AB",
        status: "Completada",
      },
      {
        id: 17,
        title: "Transferencia recibida de Roberto Carlos",
        subtitle: "25 Jul 16:20 · TRANSFERENCIAS",
        type: 2,
        amount: 7500.00,
        category: "TRANSFERENCIAS",
        date: "2026-07-25T16:20:00Z",
        toAccountId: "4",
        counterpart: "Roberto Carlos",
        status: "Completada",
      },
      {
        id: 18,
        title: "Farmacity Recoleta",
        subtitle: "01 Sep 11:45 · SALUD",
        type: 3,
        amount: 6350.00,
        category: "SALUD",
        date: "2026-09-01T11:45:00Z",
        toAccountId: null,
        counterpart: "Farmacity S.A.",
        status: "Completada",
      },
      {
        id: 19,
        title: "Supermercado Coto",
        subtitle: "15 Jul 20:10 · COMPRAS",
        type: 3,
        amount: 32400.00,
        category: "COMPRAS",
        date: "2026-07-15T20:10:00Z",
        toAccountId: null,
        counterpart: "Coto C.I.C.S.A.",
        status: "Completada",
      },
      {
        id: 20,
        title: "Depósito inicial apertura de cuenta",
        subtitle: "01 Jul 08:00 · DEPÓSITOS",
        type: 1,
        amount: 50000.00,
        category: "DEPÓSITOS",
        date: "2026-07-01T08:00:00Z",
        toAccountId: null,
        counterpart: "Apertura DigitalArs",
        status: "Completada",
      },
    ];
  },
};

export default transactionService;
