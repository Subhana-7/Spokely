import API from "../api/axios.instance";
import Cookies from "js-cookie";
import { USER_ROUTES as U, MENTOR_ROUTES as M, ADMIN_ROUTES as A } from "../constants/routes";

// --------------------- TYPES ---------------------
export type Role = "user" | "mentor" | "admin";

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  documentUrl?: string;
  textMessage?: string;
}

interface LoginData {
  email: string;
  password: string;
}

// --------------------- AUTHENTICATION ---------------------
export const signup = (data: SignupData) => {
  const { role, ...payload } = data;
  const endpoint = role === "mentor" ? `${M.base}${M.signup}` : `${U.base}${U.signup}`;
  return API.post(endpoint, payload);
};

export const login = (data: LoginData, role: Role) => {
  const endpoint =
    role === "mentor"
      ? `${M.base}${M.login}`
      : role === "user"
      ? `${U.base}${U.login}`
      : `${A.base}${A.login}`;
  return API.post(endpoint, data);
};

export const logoutService = (role: Exclude<Role, "admin">) => {
  const endpoint = role === "mentor" ? `${M.base}${M.logout}` : `${U.base}${U.logout}`;
  return API.post(endpoint);
};

export const refreshToken = async () => {
  const role = Cookies.get("role") as Role | undefined;
  const endpoint =
    role === "mentor"
      ? `${M.base}${M.refreshToken}`
      : role === "user"
      ? `${U.base}${U.refreshToken}`
      : `${A.base}${A.refreshToken}`;

  try {
    const res = await API.post(endpoint, null, { withCredentials: true });
    return res.data;
  } catch {
    return null;
  }
};

// --------------------- OTP & PASSWORD ---------------------
export const sendOTP = (data: { email: string }, role: Exclude<Role, "admin">) => {
  const endpoint = role === "mentor" ? `${M.base}${M.sendOTP}` : `${U.base}${U.sendOTP}`;
  return API.post(endpoint, data);
};

export const verifyOTP = (data: { email: string; code: string }, role: Exclude<Role, "admin">) => {
  const endpoint = role === "mentor" ? `${M.base}${M.verifyOTP}` : `${U.base}${U.verifyOTP}`;
  return API.post(endpoint, data);
};

export const sendForgotPasswordOTP = (data: { email: string }, role: string) => {
  const endpoint = role === "mentor" ? `${M.base}${M.sendForgotPasswordOTP}` : `${U.base}${U.sendForgotPasswordOTP}`;
  return API.post(endpoint, data);
};

export const verifyForgotPasswordOTP = (data: { email: string; code: string }, role: Exclude<Role, "admin">) => {
  const endpoint = role === "mentor" ? `${M.base}${M.verifyForgotPasswordOTP}` : `${U.base}${M.verifyForgotPasswordOTP}`;
  return API.post(endpoint, data);
};

export const resetPassword = (data: { email: string; newPassword: string }, role: Exclude<Role, "admin">) => {
  const endpoint = role === "mentor" ? `${M.base}${M.resetPassword}` : `${U.base}${U.resetPassword}`;
  return API.post(endpoint, data);
};

// --------------------- MENTOR DOCUMENT ---------------------
export const resubmitDocument = (email: string, documentUrl: string, textMessage: string) =>
  API.patch(`${M.base}${M.resubmitDocument}`, { email, documentUrl, textMessage });

// --------------------- HOME & PROFILE ---------------------
export const home = async () => {
  const role = Cookies.get("role") as Exclude<Role, "admin"> | undefined;
  const endpoint = role === "mentor" ? `${M.base}${M.home}` : `${U.base}${U.home}`;
  const res = await API.post(endpoint);
  return res.data;
};

export const userProfiles = (id: string) => API.get(`${U.base}${U.peerProfile}/${id}`);
export const mentorProfile = (id: string) => API.get(`${M.base}${M.mentorProfile}/${id}`);

export const editUserDetails = async (
  id: string,
  role: Exclude<Role, "admin">,
  data: Record<string, any>
) => {
  console.log('hiting')
  const endpoint =
    role === "mentor" ? `${M.base}${M.edit}/${id}` : `${U.base}${U.edit}/${id}`;

  const res = await API.post(endpoint, data);
  return res.data?.updatedMentor || res.data?.user || res.data;
};


export const changePassword = (role: Exclude<Role, "admin">, data: any) => {
  const endpoint = role === "mentor" ? `${M.base}${M.changePassword}` : `${U.base}${U.changePassword}`;
  return API.post(endpoint, data);
};


export const getUserStats = async () => {
  const res = await API.get("/users/home");
  return res.data;
};
