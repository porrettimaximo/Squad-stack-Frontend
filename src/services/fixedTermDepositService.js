import api from "./api";

/**
 * Servicio de Depósitos a Plazo Fijo (HU-33).
 */
export const fixedTermDepositService = {
  /**
   * Crea un nuevo depósito a plazo fijo debitando saldo de la cuenta.
   * @param {Object} data - { amount, durationDays }
   * @returns {Promise<Object>}
   */
  async create(data) {
    const payload = {
      amount: Number(data.amount),
      durationDays: Number(data.durationDays),
    };
    const response = await api.post("/fixed-deposits", payload);
    return response.data;
  },

  /**
   * Obtiene la lista de depósitos a plazo fijo del usuario autenticado.
   * @returns {Promise<Array>}
   */
  async getMyDeposits() {
    const response = await api.get("/fixed-deposits/me");
    return response.data;
  },

  /**
   * Simula el rendimiento según monto y días sin comprometer fondos.
   * @param {Object} data - { amount, durationDays }
   * @returns {Promise<Object>}
   */
  async simulate(data) {
    const payload = {
      amount: Number(data.amount),
      durationDays: Number(data.durationDays),
    };
    const response = await api.post("/fixed-deposits/simulate", payload);
    return response.data;
  },
};

export default fixedTermDepositService;
