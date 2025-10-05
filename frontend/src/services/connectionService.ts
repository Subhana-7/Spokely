import API from "../api/axios.instance";

export const sendConnectionRequest = (uniqueCode: string) =>
  API.post("/users/connections/send", { uniqueCode });

export const getConnectionRequests = () => API.get("/users/connections/requests");

export const acceptConnectionRequest = (requestId: string) =>
  API.patch("/users/connections/accept",{requestId});

export const rejectConnectionRequest = (requestId: string) =>
  API.delete(`/users/connections/reject/${requestId}`);
export const getAllConnections = (search?: string) =>
  API.get(`/users/connections/list${search ? `?search=${encodeURIComponent(search)}` : ""}`);

export const getSentConnectionRequests = () => API.get("/users/connections/sent-requests");
