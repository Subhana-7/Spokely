import API from "../api/axios.instance";
import Cookies from "js-cookie";

// --------------------- AUTHENTICATION ---------------------

export const login = (data: { email: string; password: string }, role: "user" | "mentor" | "admin") => {
  const endpoint =
    role === "mentor"
      ? "/mentors/login"
      : role === "user"
      ? "/users/login"
      : "/admin/login";
  return API.post(endpoint, data);
};

export const logoutService = (role: "user" | "mentor" | "admin") => {
  const endpoint =
    role === "mentor"
      ? "/mentors/logout"
      : role === "user"
      ? "/users/logout"
      : "/admin/logout";
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
