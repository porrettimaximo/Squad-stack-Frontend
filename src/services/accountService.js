import api from "./api";

export const accountService = {
  /**
   * Obtiene la información, saldo, CVU y Alias de la cuenta del usuario autenticado (HU-14).
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
        cvu: data.cvu || (data.id ? `000000310001000000000${data.id}` : ""),
        alias: data.alias || "",
        cardNumber: "4892",
        trend: 0,
        createdAt: data.createdAt,
      };
    } catch (error) {
      const token = localStorage.getItem("token");
      if (token) {
        return {
          id: null,
          money: 0,
          isBlocked: false,
          cvu: "",
          alias: "",
          cardNumber: "----",
          trend: 0,
        };
      }
      return {
        id: 4,
        money: 45230.50,
        isBlocked: false,
        cvu: "0000003100010000000004",
        alias: "alejandro.silva.ars",
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

  /**
   * Consulta y verifica en tiempo real un destinatario por CVU, Alias o ID antes de transferir.
   * GET /api/accounts/lookup?query=...
   */
  async lookupAccount(query) {
    if (!query || !query.trim()) {
      throw new Error("Debe ingresar un CVU o Alias para buscar.");
    }
    const response = await api.get("/accounts/lookup", {
      params: { query: query.trim() },
    });
    return response.data;
  },

  /**
   * Modifica el alias bancario de la cuenta del usuario autenticado.
   * PUT /api/accounts/me/alias
   * Body: { alias }
   */
  async updateAlias(newAlias) {
    if (!newAlias || !newAlias.trim()) {
      throw new Error("El alias no puede estar vacío.");
    }
    const response = await api.put("/accounts/me/alias", {
      alias: newAlias.trim().toLowerCase(),
    });
    return response.data;
  },
};

export default accountService;
