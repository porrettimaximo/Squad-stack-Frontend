import api from "./api";

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

      if (response.data?.items && response.data.items.length > 0) {
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

          return {
            id: tx.id,
            title: tx.concept || defaultTitle,
            subtitle: `${formattedDate} · ${categoryName}`,
            type: tx.type,
            amount: tx.amount,
            category: categoryName,
            isIncome,
            toAccountId: tx.toAccountId,
          };
        });
      }

      return this.getDemoTransactions();
    } catch {
      return this.getDemoTransactions();
    }
  },

  /**
   * Obtiene el historial paginado de movimientos con filtros (HU-27).
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
    if (type !== null && type !== "" && type !== "all") params.type = Number(type);
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    try {
      const response = await api.get("/transactions/me", { params });
      if (response.data?.items) {
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

          return {
            id: tx.id,
            title: tx.concept || defaultTitle,
            subtitle: `${formattedDate} · ${categoryName}`,
            rawDate: tx.date,
            formattedDate,
            type: tx.type,
            amount: tx.amount,
            category: categoryName,
            isIncome,
            toAccountId: tx.toAccountId,
          };
        });

        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          items = items.filter((item) => item.title.toLowerCase().includes(q));
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
      // Fallback a filtrado en memoria
    }

    // Modo autónomo / memoria
    let pool = localTransactions.length > 0 ? [...localTransactions] : this.getDemoTransactions();

    if (type !== null && type !== "" && type !== "all") {
      pool = pool.filter((t) => t.type === Number(type));
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      pool = pool.filter((t) => (t.date ? new Date(t.date) >= from : true));
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      pool = pool.filter((t) => (t.date ? new Date(t.date) <= to : true));
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      pool = pool.filter((t) => t.title?.toLowerCase().includes(q) || t.subtitle?.toLowerCase().includes(q));
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
  async transfer({ destination, destinationAccountId, amount }) {
    const destId = destinationAccountId || destination;
    const response = await api.post("/transactions/transfer", {
      destinationAccountId: Number(destId),
      amount: Number(amount),
    });
    return response.data;
  },

  /**
   * Movimientos de demostración exactos del diseño en Figma.
   */
  getDemoTransactions() {
    return [
      {
        id: 1,
        title: "Mercado Libre",
        subtitle: "Hoy 14:30 · COMPRAS",
        type: 3,
        amount: 1250.00,
        category: "COMPRAS",
        date: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Transferencia Recibida",
        subtitle: "Ayer 09:15 · INGRESO",
        type: 2,
        amount: 15000.00,
        category: "INGRESO",
        date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        title: "Starbucks",
        subtitle: "Ayer 08:30 · COMIDA",
        type: 3,
        amount: 850.00,
        category: "COMIDA",
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 4,
        title: "Netflix Suscripción",
        subtitle: "12 Mar 21:00 · SERVICIOS",
        type: 3,
        amount: 8500.00,
        category: "SERVICIOS",
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ];
  },
};

export default transactionService;
