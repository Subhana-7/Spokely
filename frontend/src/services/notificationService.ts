import API from "../api/axios.instance";
import { NOTIFICATION_ROUTES as R } from "../constants/routes";

export const getNotifications = async (userId: string) => {
  const res = await API.get(`${R.base}/${userId}`);
  return res.data.data;
};

export const markNotificationAsRead = async (id: string) => {
  const res = await API.patch(`${R.base}/${id}${R.read}`);
  return res.data;
};

export const markAllNotificationsAsRead = async (
  notifications: { id: string; isRead: boolean }[]
) => {
  const unread = notifications.filter((n) => !n.isRead);

  return Promise.all(
    unread.map((n) => API.patch(`${R.base}/${n.id}${R.read}`))
  );
};
