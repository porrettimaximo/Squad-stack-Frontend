import api from "./api";

/**
 * Servicio de Notificaciones en Backend.
 */
export const getMyNotifications = async (limit = 20) => {
  const response = await api.get(`/notifications?limit=${limit}`);
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data?.count ?? 0;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.put("/notifications/read-all");
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const deleteAllNotifications = async () => {
  const response = await api.delete("/notifications");
  return response.data;
};

export default {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
};

