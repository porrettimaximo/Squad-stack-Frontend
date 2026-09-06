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
        money: Number(data.balance ?? data.money ?? 0),
        isBlocked: data.isBlocked ?? false,
        cardNumber: "4892",
        trend: 0,
        createdAt: data.createdAt,
      };
    } catch (error) {
      const token = localStorage.getItem("token");
      if (token) {
        // Con sesión pero con error (ej. sin cuenta aún)
        return {
          id: null,
          money: 0,
          isBlocked: false,
          cardNumber: "----",
          trend: 0,
        };
      }
      // Retorna el perfil y saldo base de Figma únicamente en modo autónomo offline (sin sesión)
      return {
        id: 4,
        money: 45230.50,
        isBlocked: false,
        cardNumber: "4892",
        trend: 2.4,
      };
    }
  },

  /**
   * Deposita fondos en la cuenta del usuario (HU-15).
   * POST /api/accounts/deposit
   * Body: { amount, concept }
   */
  async deposit(amount, concept = null) {
    const payload = {
      amount: Number(amount),
    };
    if (concept) {
      payload.concept = concept;
    }
    const response = await api.post("/accounts/deposit", payload);
    return response.data;
  },
};

export default accountService;
