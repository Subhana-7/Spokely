import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: "http://localhost:5000/api/users/connections",
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

export const sendConnectionRequest = (referralCode: string) =>
  API.post("/send", { referralCode });

export const getConnectionRequests = () =>
  API.get("/requests");

export const acceptConnectionRequest = (requestId: string) =>
  API.patch(`/accept/${requestId}`);

export const getAllConnections = () => API.get("/list");
