import api from "./api";

/**
 * Servicio de Tarjetas (HU-35).
 */
export const cardService = {
  /**
   * Solicita la emisión de una tarjeta virtual para el usuario autenticado.
   * @returns {Promise<Object>}
   */
  async requestVirtualCard() {
    const response = await api.post("/cards/virtual");
    return response.data;
  },

  /**
   * Obtiene la lista de tarjetas activas del usuario autenticado (enmascaradas).
   * @returns {Promise<Array>}
   */
  async getMyCards() {
    const response = await api.get("/cards/me");
    return response.data;
  },

  /**
   * Obtiene los datos sensibles y completos (número completo y CVV) de una tarjeta.
   * @param {number} cardId
   * @returns {Promise<Object>}
   */
  async revealCard(cardId) {
    const response = await api.get(`/cards/${cardId}/reveal`);
    return response.data;
  },

  /**
   * Congela o descongela temporalmente una tarjeta.
   * @param {number} cardId
   * @returns {Promise<Object>}
   */
  async toggleFreeze(cardId) {
    const response = await api.patch(`/cards/${cardId}/freeze`);
    return response.data;
  },

  /**
   * Da de baja definitiva una tarjeta.
   * @param {number} cardId
   * @returns {Promise<void>}
   */
  async deactivateCard(cardId) {
    await api.delete(`/cards/${cardId}`);
  },
};

export default cardService;
