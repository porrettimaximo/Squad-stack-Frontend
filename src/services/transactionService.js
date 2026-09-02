import apiClient from "./apiClient";

export const transactionService = {
  /**
   * Obtiene el historial paginado de movimientos con filtros (HU-17).
   * GET /api/transactions/me
   * @param {Object} params - { page, pageSize, type, dateFrom, dateTo, amountMin, amountMax }
   * @returns {Promise<Object>} { items: [], page, pageSize, totalItems, totalPages }
   */
  async getMyHistory(params = {}) {
    const response = await apiClient.get("/transactions/me", { params });
    return response.data;
  },
};

export default transactionService;
