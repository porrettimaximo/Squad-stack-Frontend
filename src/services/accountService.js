import api from "./api";

export const accountService = {
  /**
   * Obtiene la información y saldo de la cuenta del usuario autenticado (HU-14).
   * GET /api/accounts/me
   */
  async getMyAccount() {
    try {
      const response = await api.get("/accounts/me");
      const data = response.data;
      return {
        id: data.id,
        money: Number(data.balance ?? data.money ?? 500000.00),
        isBlocked: data.isBlocked ?? false,
        cardNumber: "4892",
        trend: 2.4,
        createdAt: data.createdAt,
      };
    } catch (error) {
      console.warn("GET /api/accounts/me fallo o no disponible, usando fallback:", error.message);
      return {
        id: 1,
        money: 500000.00,
        isBlocked: false,
        cardNumber: "4892",
        trend: 2.4,
      };
    }
  },

  /**
   * Deposita fondos en la cuenta del usuario (HU-15).
   * POST /api/accounts/deposit
   * Body: { amount }
   */
  async deposit(amount) {
    const response = await api.post("/accounts/deposit", {
      amount: Number(amount),
    });
    return response.data;
  },
};

export default accountService;
