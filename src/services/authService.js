import api from "./api";

export const authService = {
  /**
   * Autenticación contra el backend (HU-10).
   * POST /api/auth/login
   */
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  /**
   * Garantiza que exista un token JWT para las peticiones mientras no haya pantalla de login.
   * Utiliza el usuario Administrador del Seed Data si no hay sesión activa.
   */
  async ensureAuth() {
    let token = localStorage.getItem("token");
    if (token) return token;

    try {
      // Login silencioso con el seed data de desarrollo de .NET
      const data = await this.login("admin@digitalars.com", "Admin123!");
      return data.token;
    } catch (error) {
      console.warn("No se pudo realizar el login de desarrollo automático:", error.message);
      return null;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken() {
    return localStorage.getItem("token");
  },
};

export default authService;
