import axios from "axios";
import { refreshToken } from "./authServices";

const BASE = `${import.meta.env.VITE_SERVER_SIDE_URL}/api/users/session`;

const API = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh-token")
    ) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return API(originalRequest);
      } catch (refreshError) {
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);

export const createSession = (data: any) => API.post("/schedule", data);
export const getSessions = () => API.get("/list");
export const getSessionById = (id: string) => API.get(`/details/${id}`);
export const updateSession = (id: string, updates: any) => API.patch(`/${id}`, updates);

export const respondToInvite = (id: string, status: "accepted" | "rejected") =>
  API.post(`/${id}/respond`, { status });

export const cancelParticipation = (id: string, reason: string) =>
  API.post(`/${id}/cancel-participation`, { reason });

export const cancelSession = (id: string, reason: string) =>
  API.post(`/${id}/cancel-session`, { reason });

export const flagSession = (id: string, reason: string, againstUser: string) =>
  API.post(`/${id}/flag`, { reason, againstUser });

export const getAgoraToken = (id: string) => API.get(`/${id}/token`);

export const getPublicSessions = () => API.get("/public-sessions");
