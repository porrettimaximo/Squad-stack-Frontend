import axios from "axios";

/**
 * Instancia centralizada de Axios para peticiones HTTP.
 * - Inyecta token JWT de Authorization si existe en localStorage.
 * - Maneja respuestas de error de forma segura sin forzar redirecciones invasivas.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5065/api",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
  timeout: 7000,
});

// Interceptor de token y cache-busting
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Evitar cache del navegador en peticiones GET
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// Servicio de autenticacion
export const loginApi = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export default api;
