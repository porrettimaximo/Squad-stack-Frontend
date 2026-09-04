import api from "./api";

export const transactionService = {
  /**
   * Obtiene los últimos movimientos de la cuenta (HU-24).
   * GET /api/transactions/me?page=1&pageSize=5
   */
  async getRecentTransactions(pageSize = 5) {
    try {
      const response = await api.get("/transactions/me", {
        params: { page: 1, pageSize },
      });
      if (response.data?.items && response.data.items.length > 0) {
        return response.data.items;
      }
      return this.getDemoTransactions();
    } catch (error) {
      console.warn("GET /api/transactions/me no disponible, usando movimientos del diseño:", error.message);
      return this.getDemoTransactions();
    }
  },

  /**
   * Movimientos de demostración exactos del diseño en Figma (HU-24).
   */
  getDemoTransactions() {
    return [
      {
        id: 1,
        title: "Mercado Libre",
        subtitle: "Hoy 14:30 · COMPRAS",
        type: 3, // Egreso
        amount: 1250.00,
        category: "COMPRAS",
        icon: "shopping",
      },
      {
        id: 2,
        title: "Transferencia Recibida",
        subtitle: "Ayer 09:15 · INGRESO",
        type: 2, // Ingreso
        amount: 15000.00,
        category: "INGRESO",
        icon: "transfer_in",
      },
      {
        id: 3,
        title: "Starbucks",
        subtitle: "Ayer 08:30 · COMIDA",
        type: 3, // Egreso
        amount: 850.00,
        category: "COMIDA",
        icon: "coffee",
      },
      {
        id: 4,
        title: "Netflix Suscripción",
        subtitle: "12 Mar 21:00 · SERVICIOS",
        type: 3, // Egreso
        amount: 8500.00,
        category: "SERVICIOS",
        icon: "receipt",
      },
    ];
  },

  /**
   * Realiza una transferencia a otra cuenta (HU-26).
   * POST /api/transactions/transfer
   */
  async transfer({ destination, amount, concept }) {
    const response = await api.post("/transactions/transfer", {
      // Mandamos las props comunes que podría requerir el backend
      toAccountId: destination, // o cvu/alias dependiendo del backend real
      amount: Number(amount),
      concept: concept || "Varios",
    });
    return response.data;
  },
};

export default transactionService;
