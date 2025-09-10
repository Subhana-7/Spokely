// src/services/axios.instance.ts
import axios, { AxiosError } from "axios";
import { refreshToken } from "../services/authServices";

const BASE_URL = import.meta.env.VITE_SERVER_SIDE_URL + "/api";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Response interceptor for handling 401 and general errors
API.interceptors.response.use(
  (res) => res,
  async (err: AxiosError & { config: any }) => {
    const originalRequest = err.config;

    // Handle 401 - refresh token
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

    // General error logging
    if (err.response) {
      console.error("API Error:", err.response.data);
      return Promise.reject(err.response.data);
    } else if (err.request) {
      console.error("No response received:", err.request);
      return Promise.reject({ message: "No response from server" });
    } else {
      console.error("Request setup error:", err.message);
      return Promise.reject({ message: err.message });
    }
  }
);

export default API;
