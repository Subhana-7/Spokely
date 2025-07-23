import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_SIDE_URL}/api/users/connections`,
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

export const getSentConnectionRequests = () =>
  API.get("/sent-requests");

export const rejectConnectionRequest = (requestId: string) =>
  API.delete(`/reject/${requestId}`); //add it 

