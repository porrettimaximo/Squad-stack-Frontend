import api from "./api";

/**
 * Obtiene todas las reservas activas del usuario.
 */
export const getReserves = async () => {
  const response = await api.get("/reserves");
  return response.data;
};

/**
 * Crea una nueva reserva de dinero.
 * @param {Object} data - { name, targetAmount, icon, color }
 */
export const createReserve = async (data) => {
  const response = await api.post("/reserves", data);
  return response.data;
};

/**
 * Ingresa dinero desde la cuenta corriente hacia la reserva.
 * @param {number} reserveId 
 * @param {number} amount 
 */
export const depositIntoReserve = async (reserveId, amount) => {
  const response = await api.post(`/reserves/${reserveId}/deposit`, { amount });
  return response.data;
};

/**
 * Retira / libera dinero de la reserva hacia la cuenta corriente.
 * @param {number} reserveId 
 * @param {number} amount 
 */
export const withdrawFromReserve = async (reserveId, amount) => {
  const response = await api.post(`/reserves/${reserveId}/withdraw`, { amount });
  return response.data;
};

/**
 * Elimina una reserva, reintegrando automáticamente cualquier saldo restante a la cuenta.
 * @param {number} reserveId 
 */
export const deleteReserve = async (reserveId) => {
  await api.delete(`/reserves/${reserveId}`);
};
