import API from "../api/axios.instance";
import { SESSION_ROUTES as R } from "../constants/routes";

export interface Session {
  id: string;
  title: string;
  description?: string;
  participants: string[];
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface Feedback {
  to: string;
  comment: string;
  rating?: number;
}

// --- User Sessions ---
export const createSession = (data: any) => API.post(`${R.base}${R.schedule}`, data);

export const getSessions = () => API.get<Session[]>(`${R.base}${R.list}`);

export const getSessionById = (id: string) => API.get<Session>(`${R.base}${R.details}/${id}`);

export const updateSession = (id: string, updates: any) =>
  API.patch(`${R.base}/${id}`, updates);

export const respondToInvite = (id: string, status: "accepted" | "rejected") =>
  API.post(`${R.base}/${id}${R.respond}`, { status });

export const cancelParticipation = (id: string, reason: string) =>
  API.post(`${R.base}/${id}${R.cancelParticipation}`, { reason });

export const cancelSession = (userId: string, sessionId: string, reason: string) =>
  API.post(`${R.base}/${sessionId}${R.cancelSession}`, { userId, reason });

export const flagSession = (id: string, reason: string, againstUser: string) =>
  API.post(`${R.base}/${id}${R.flag}`, { reason, againstUser });

export const getAgoraToken = (id: string) => API.get(`${R.base}/${id}${R.token}`);

export const getPublicSessions = () => API.get(`${R.base}${R.publicSessions}`);

export const addFeedback = (id: string, data: Feedback) =>
  API.post(`${R.base}/${id}${R.feedback}`, data);

// --- Admin Sessions ---
export const adminSessionListing = (params: { page: number; limit: number; search: string; status: string }) =>
  API.get(`${R.base}${R.adminList}`, { params });

export const adminSessionDetails = (id: string) =>
  API.get(`${R.base}/${id}${R.adminDetails}`);
