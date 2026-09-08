import api from "./api";

/**
 * Obtiene el catálogo de empresas y servicios disponibles.
 * @param {number|null} category - ID de categoría opcional (1: Luz, 2: Agua, 3: Gas, 4: Telco, 5: Impuestos)
 */
export const getServiceProviders = async (category = null) => {
  const params = category ? { category } : {};
  const response = await api.get("/services/providers", { params });
  return response.data;
};

/**
 * Simula la consulta de una factura a partir de un código de pago o número de cliente.
 * @param {number} providerId 
 * @param {string} referenceNumber 
 */
export const simulateInvoice = async (providerId, referenceNumber) => {
  const response = await api.get("/services/invoice/simulate", {
    params: { providerId, referenceNumber },
  });
  return response.data;
};

/**
 * Realiza el pago de un servicio.
 * @param {Object} payload - { serviceProviderId, referenceNumber, amount, reserveId }
 */
export const payService = async (payload) => {
  const response = await api.post("/services/pay", payload);
  return response.data;
};

/**
 * Obtiene el historial de comprobantes de servicios pagados por el usuario actual.
 */
export const getMyServicePayments = async () => {
  const response = await api.get("/services/my-payments");
  return response.data;
};
