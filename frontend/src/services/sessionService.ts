import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_SIDE_URL}/api/users/session`,
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
export const getSessionById = (id: string) => API.get(`/details/${id}`);
export const updateSession = (id: string, updates: any) => API.patch(`/${id}`, updates);
export const getPublicSessions = () => API.get(`/public-sessions`);
export const sessionPayment = (id:string) => API.post(`/payment`)

export const videoCall = async (sessionId: string) => {
  return await API.get(`/${sessionId}/token`, {
    withCredentials: true,
  });
};
