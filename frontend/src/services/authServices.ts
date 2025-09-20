import API from "../api/axios.instance";
import Cookies from "js-cookie";

// --------------------- AUTHENTICATION ---------------------

export const signup = (data: any) => {
  const { name, email, phone, password, role, documentUrl, textMessage } = data;
  const payload =
    role === "mentor"
      ? { name, email, phone, password, documentUrl, textMessage }
      : { name, email, phone, password };

  const endpoint = role === "mentor" ? "/mentors/signup" : "/users/signup";
  return API.post(endpoint, payload);
};

export const login = (
  data: { email: string; password: string },
  role: "user" | "mentor" | "admin"
) => {
  const endpoint =
    role === "mentor"
      ? "/mentors/login"
      : role === "user"
      ? "/users/login"
      : "/admin/login";

  return API.post(endpoint, data);
};

export const logoutService = (role: "user" | "mentor") => {
  const endpoint = role === "mentor" ? "/mentors/logout" : "/users/logout";
  return API.post(endpoint);
};

export const refreshToken = async () => {
  const role = Cookies.get("role");

  const endpoint =
    role === "mentor"
      ? "/mentors/refresh-token"
      : role === "user"
      ? "/users/refresh-token"
      : "/admin/refresh-token";

  try {
    const res = await API.post(endpoint, null, { withCredentials: true });
    return res.data;
  } catch (err) {
    return null;
  }
};

// --------------------- OTP & PASSWORD ---------------------

export const sendOTP = (data: { email: string }, role: "user" | "mentor") => {
  const endpoint = role === "mentor" ? "/mentors/send-otp" : "/users/send-otp";
  return API.post(endpoint, data);
};

export const verifyOTP = (data: { email: string; code: string }, role: "user" | "mentor") => {
  const endpoint = role === "mentor" ? "/mentors/verify-otp" : "/users/verify-otp";
  return API.post(endpoint, data);
};

export const sendForgotPasswordOTP = (
  data: { email: string; newPassword?: string },
  role: "user" | "mentor"
) => {
  const endpoint = role === "mentor" ? "/mentors/forgot-password" : "/users/forgot-password";
  return API.post(endpoint, data);
};

export const verifyForgotPasswordOTP = (
  data: { email: string; code: string },
  role: "user" | "mentor"
) => {
  const endpoint =
    role === "mentor" ? "/mentors/verify-forgot-password" : "/users/verify-forgot-password";
  return API.post(endpoint, data);
};

// --------------------- MENTOR DOCUMENT ---------------------

export const resubmitDocument = (email: string, documentUrl: string, textMessage: string) => {
  return API.patch("/mentors/re-submit", { email, documentUrl, textMessage });
};

// --------------------- HOME & PROFILE ---------------------

export const home = async () => {
  const role = Cookies.get("role");
  const endpoint = role === "mentor" ? "/mentors/home" : "/users/home";
  const res = await API.post(endpoint);
  return res.data;
};

export const userProfiles = async (id: string) => {
  const endpoint = `/users/peer/profile/${id}`;
  const res = await API.get(endpoint);
  return res.data;
};

export const mentorProfile = async (id: string) => {
  const endpoint = `/mentors/mentor-profile/${id}`;
  const res = await API.get(endpoint);
  return res.data;
};

export const editUserDetails = async (id: string, role: string, data: Record<string, any>) => {
  const endpoint = role === "mentor" ? `/mentors/edit/${id}` : `/users/edit/${id}`;
  const res = await API.post(endpoint, data);
  return res.data;
};

export const changePassword = async(role:string,data:any) => {
  const endpoint = role === "mentor" ? `/mentors/change-password` : `/users/change-password`;
  const res = await API.post(endpoint,data);
  return res.data;
}
