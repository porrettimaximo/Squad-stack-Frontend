import api from "./api";

export const userService = {
  /**
   * Obtiene los datos del perfil del usuario autenticado (HU-13).
   * GET /api/users/me
   */
  async getMyProfile() {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (error) {
      console.warn("No se pudo obtener el perfil de /users/me, usando valor por defecto:", error.message);
      return null;
    }
  },
};

export default userService;
