import axios from "axios";
import { refreshToken } from "./authServices";

const BASE = `${import.meta.env.VITE_SERVER_SIDE_URL}/api/chat`;

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

export const getMessages = (sessionId: string) => {
  return API.get(`/${sessionId}`);
};

export const sendMessage = (sessionId: string, text: string) => {
  return API.post(`/${sessionId}`, { text });
};
