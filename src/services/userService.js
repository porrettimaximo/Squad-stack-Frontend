import api from "./api";

/**
 * Servicio de Gestión de Usuarios (HU-12 / HU-13 / HU-29).
 */
export const userService = {
  /**
   * Obtiene el listado paginado de usuarios con filtros opcionales.
   * @param {Object} params - { page, pageSize, name, email, role, isActive }
   * @returns {Promise<{ items: Array, page: number, pageSize: number, totalItems: number, totalPages: number }>}
   */
  async getUsers(params = {}) {
    const {
      page = 1,
      pageSize = 10,
      name = "",
      email = "",
      role = "",
      isActive = null,
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("pageNumber", page);
    queryParams.append("pageSize", pageSize);

    if (name) queryParams.append("name", name);
    if (email) queryParams.append("email", email);
    if (role) queryParams.append("role", role);
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      queryParams.append("isActive", isActive);
    }

    const response = await api.get(`/users?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Obtiene el detalle de un usuario por su ID.
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo usuario y su cuenta bancaria asociada en una misma transacción.
   * @param {Object} userData - { firstName, lastName, email, password, role, initialBalance }
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    const payload = {
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.trim(),
      password: userData.password,
      role: userData.role || "User",
      initialBalance: Number(userData.initialBalance) || 0,
    };

    const response = await api.post("/users", payload);
    return response.data;
  },

  /**
   * Actualiza los datos de un usuario existente.
   * @param {number} id
   * @param {Object} userData - { firstName, lastName, email, role }
   * @returns {Promise<Object>}
   */
  async updateUser(id, userData) {
    const payload = {
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.trim(),
      role: userData.role || "User",
    };

    const response = await api.put(`/users/${id}`, payload);
    return response.data;
  },

  /**
   * Realiza la baja lógica de un usuario (IsActive = false).
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

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
