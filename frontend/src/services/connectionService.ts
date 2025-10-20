import API from "../api/axios.instance";
import { CONNECTION_ROUTES as R } from "../constants/routes";

export const sendConnectionRequest = (uniqueCode: string) =>
  API.post(`${R.base}${R.send}`, { uniqueCode });

export const getConnectionRequests = () => API.get(`${R.base}${R.requests}`);

export const acceptConnectionRequest = (requestId: string) =>
  API.patch(`${R.base}${R.accept}`, { requestId });

export const rejectConnectionRequest = (requestId: string) =>
  API.delete(`${R.base}${R.reject}/${requestId}`);

export const getAllConnections = (search?: string) =>
  API.get(`${R.base}${R.list}${search ? `?search=${encodeURIComponent(search)}` : ""}`);

export const getSentConnectionRequests = () => API.get(`${R.base}${R.sentRequests}`);

export const blockUnblockUser = (connectionId: string, isBlocked: boolean) => {
  console.log('frontend service hiting?')
  const endpoint = isBlocked
    ? `/users/connections/${connectionId}/unblock`
    : `/users/connections/${connectionId}/block`;

  return API.patch(endpoint);
};

export const removeConnection = (connectionId:string) => API.delete(`/users/connections/remove/${connectionId}`);
