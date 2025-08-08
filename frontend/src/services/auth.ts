import axios from "axios";
import Cookies from "js-cookie";

const BASE = import.meta.env.VITE_SERVER_SIDE_URL;

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
        // Clear session and redirect
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);


export const login = (data: { email: string; password: string }, role: "user" | "mentor") => {
  const endpoint = role === "mentor" ? "/api/mentors/login" : "/api/users/login";
  return API.post(endpoint, data);
};

export const logoutService = (role: "user" | "mentor") => {
  const endpoint = role === "mentor" ? "/api/mentors/logout" : "/api/users/logout";
  return API.post(endpoint);
};

export const refreshToken = async () => {
  const role = Cookies.get("role");

  const endpoint =
    role === "mentor"
      ? "/api/mentors/refresh-token"
      : "/api/users/refresh-token";

  try {
    const res = await API.post(endpoint, null, {
      withCredentials: true, 
    });

    return res.data; 
  } catch (err) {
    return null;
  }
};
