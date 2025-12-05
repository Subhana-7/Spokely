import API from "../api/axios.instance";
import { CONNECTION_ROUTES as R } from "../constants/routes";

export const sendConnectionRequest = (uniqueCode: string) =>
  API.post(`${R.base}${R.send}`, { uniqueCode });

export const getConnectionRequests = () => API.get(`${R.base}${R.requests}`);

export const acceptConnectionRequest = (requestId: string) =>
  API.patch(`${R.base}${R.accept}`, { requestId });

export const rejectConnectionRequest = (requestId: string) =>
  API.delete(`${R.base}${R.reject}/${requestId}`);

export const getAllConnections = (params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();

  if (params?.search) query.append("search", params.search);
  if (params?.status && params.status !== "all")
    query.append("status", params.status);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return API.get(`${R.base}${R.list}${queryString}`);
};

export const getSentConnectionRequests = () =>
  API.get(`${R.base}${R.sentRequests}`);

export const blockUnblockUser = (connectionId: string, isBlocked: boolean) => {
  const endpoint = isBlocked
    ? `${R.base}/${connectionId}${R.unBlock}`
    : `${R.base}/${connectionId}${R.block}`;

  return API.patch(endpoint);
};

export const removeConnection = (connectionId: string) =>
  API.delete(`${R.base}${R.remove}/${connectionId}`);
