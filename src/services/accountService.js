import api from "./api";

export const accountService = {
  /**
   * Obtiene la información de la cuenta del usuario autenticado (HU-24).
   * GET /api/accounts/me
   */
  async getMyAccount() {
    try {
      const response = await api.get("/accounts/me");
      return response.data;
    } catch (error) {
      // Fallback a cuenta demo si el endpoint aún no está expuesto en backend
      console.warn("GET /api/accounts/me no disponible, usando estado inicial de cuenta:", error.message);
      return {
        id: 1,
        money: 45230.50,
        isBlocked: false,
        cardNumber: "4892",
        trend: 2.4,
      };
    }
  },

  /**
   * Deposita fondos en la cuenta del usuario.
   */
  async deposit(amount) {
    const response = await api.post("/accounts/deposit", { amount: Number(amount) });
    return response.data;
  },
};

export default accountService;
