import API from "../api/axios.instance";
import { NOTIFICATION_ROUTES as R } from "../constants/routes";


export const getUserNotifications = async (userId: string) => {
  const res = await API.get(`${R.base}/${userId}`);
  return res.data.data;
};

export const markNotificationAsRead = async (id: string) => {
  await API.patch(`${R.base}/${id}${R.read}`);
};