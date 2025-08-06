import axios from "axios";
import Cookies from "js-cookie";
import { data } from "react-router-dom";

const BASE = import.meta.env.VITE_SERVER_SIDE_URL;

const API = axios.create({
  baseURL: `${BASE}`,
  withCredentials: true,
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshToken(); // hits `/refresh-token`, sets new access token cookie
        return API(originalRequest); // retry original request
      } catch (refreshError) {
        // Redirect to login page if refresh fails
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);




export const signup = (data: any) => {
  const { name, email, phone, password, role, documentUrl, textMessage } = data;
  const payload =
    role === "mentor"
      ? { name, email, phone, password, documentUrl, textMessage }
      : { name, email, phone, password };
  const endpoint =
    role === "mentor" ? "/api/mentors/signup" : "/api/users/signup";
  return API.post(endpoint, payload);
};

export const login = (
  data: { email: string; password: string },
  role: "user" | "mentor"
) => {
  const endpoint =
    role === "mentor" ? "/api/mentors/login" : "/api/users/login";
  return API.post(endpoint, data);
};

export const sendOTP = (data: { email: string }, role: "user" | "mentor") => {
  const endpoint =
    role === "mentor" ? "/api/mentors/send-otp" : "/api/users/send-otp";
  return API.post(endpoint, data);
};

export const verifyOTP = (
  data: { email: string; code: string },
  role: "user" | "mentor"
) => {
  const endpoint =
    role === "mentor" ? "/api/mentors/verify-otp" : "/api/users/verify-otp";
  return API.post(endpoint, data);
};

// New forgot password functions
export const sendForgotPasswordOTP = (
  data: { email: string; newPassword?: string },
  role: "user" | "mentor"
) => {
  const endpoint =
    role === "mentor" ? "/api/mentors/forgot-password" : "/api/users/forgot-password";
  return API.post(endpoint, data);
};

export const verifyForgotPasswordOTP = (
  data: { email: string; code: string },
  role: "user" | "mentor"
) => {
  const endpoint =
    role === "mentor" ? "/api/mentors/verify-forgot-password" : "/api/users/verify-forgot-password";
  return API.post(endpoint, data);
};

export const logoutService = (role: "user" | "mentor") => {
  const endpoint =
    role === "mentor" ? "/api/mentors/logout" : "/api/users/logout";
  return API.post(endpoint, data);
};

export const resubmitDocument = (
  email: string,
  documentUrl: string,
  textMessage: string
) => {
  console.log(email);
  const endpoint = "/api/mentors/re-submit";
  return API.patch(endpoint, { email, documentUrl, textMessage });
};


export const refreshToken = async () => {
  const role = Cookies.get("role");

  const endpoint =
    role === "mentor"
      ? "/api/mentors/refresh-token"
      : "/api/users/refresh-token";

  const res = await API.post(endpoint);
  return res.data; 
};