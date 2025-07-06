import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const API = axios.create({
  baseURL: "http://localhost:5000/api/users",
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const signup = (data: any) => {
  const payload = {
    name: data.fullName,
    email: data.email,
    phone: data.phone,
    password: data.password,
    role: data.role,
  };
  return API.post("/signup", payload);
};

export const login = (data: { email: string; password: string }) => API.post("/login", data);

export const sendOTP = (data: { email: string }) => API.post("/send-otp", data);

export const verifyOTP = (data: { email: string; code: string }) => API.post("/verify-otp", data);

export const setRole = async (role: "user" | "mentor") => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No token");

  const decoded: any = jwtDecode(token);
  const userId = decoded.id || decoded._id;

  return API.patch(
    "/update-role",
    { role, id: userId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
