import axios from "axios";

/**
 * Instancia centralizada de Axios para peticiones HTTP.
 * - Inyecta token JWT de Authorization si existe en localStorage.
 * - Maneja respuestas de error de forma segura sin forzar redirecciones invasivas.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:7142/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

// Interceptor de token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
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
  },
);

// Servicio de autenticacion
export const loginApi = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export default api;
