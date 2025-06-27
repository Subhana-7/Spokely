import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api/users" });

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



export const login = (data: { email: string; password: string }) =>
  API.post("/login", data);
