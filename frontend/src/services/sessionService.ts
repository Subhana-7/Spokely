import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: "http://localhost:5000/api/users/session",
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

export const createSession = (data: any) => API.post('/schedule', data);
export const getSessions = () => API.get('/list');
export const getSessionById = (id: string) => API.get(`/${id}`);
export const updateSession = (id: string, updates: any) => API.patch(`/${id}`, updates);
