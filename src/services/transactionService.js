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
    } catch (error) {
      console.warn("GET /api/transactions/me no disponible, usando demo:", error.message);
      return this.getDemoTransactions();
    }
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
      },
      {
        id: 2,
        title: "Transferencia Recibida",
        subtitle: "Ayer 09:15 · INGRESO",
        type: 2,
        amount: 15000.00,
        category: "INGRESO",
      },
      {
        id: 3,
        title: "Starbucks",
        subtitle: "Ayer 08:30 · COMIDA",
        type: 3,
        amount: 850.00,
        category: "COMIDA",
      },
      {
        id: 4,
        title: "Netflix Suscripción",
        subtitle: "12 Mar 21:00 · SERVICIOS",
        type: 3,
        amount: 8500.00,
        category: "SERVICIOS",
      },
    ];
  },
};

export default transactionService;
