import API from "../api/axios.instance";

export const createSession = (data: any) => API.post("/users/session/schedule", data);
export const getSessions = () => API.get("/users/session/list");
export const getSessionById = (id: string) => API.get(`/users/session/details/${id}`);
export const updateSession = (id: string, updates: any) =>
  API.patch(`/users/session/${id}`, updates);

export const respondToInvite = (id: string, status: "accepted" | "rejected") =>
  API.post(`/users/session/${id}/respond`, { status });

export const cancelParticipation = (id: string, reason: string) =>
  API.post(`/users/session/${id}/cancel-participation`, { reason });

export const cancelSession = (userId: string, sessionId: string, reason: string) =>
  API.post(`/users/session/${sessionId}/cancel-session`, { userId, reason });

export const flagSession = (id: string, reason: string, againstUser: string) =>
  API.post(`/users/session/${id}/flag`, { reason, againstUser });

export const getAgoraToken = (id: string) => API.get(`/users/session/${id}/token`);
export const getPublicSessions = () => API.get("/users/session/public-sessions");
export const addFeedback = (id: string, data: { to: string; comment: string; rating?: number }) =>
  API.post(`/users/session/${id}/feedback`, data);

export const adminSessionListing = (params: { page: number; limit: number; search: string; status: string }) =>
  API.get("/users/session/list-session", { params });

export const adminSessionDetails = (id: string) =>
  API.get(`/users/session/details/${id}/admin`);
