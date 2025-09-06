import axios from "axios";
import { refreshToken } from "./authServices";

const BASE = `${import.meta.env.VITE_SERVER_SIDE_URL}/api/subscription`;

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

export const getMentorPlans = (mentorId:string) => {
  return API.get(`/mentor/${mentorId}/plans`);
} //yet to add

export const saveMentorPlans = (mentorId: string, plans: any[]) => {
  return API.post("/mentor/plans", { mentorId, plans });
};

export const subscribeMentor = (data:any) => {
  return API.post("/subscribe", data); 
}

export const getUserSubscriptions = (userId:string) => {
  return API.get(`/my-subscriptions/${userId}`);
}