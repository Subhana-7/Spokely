import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", 
  withCredentials: true,
});

export const adminLogin = async (email: string, password: string) => {
  const response = await API.post("/admin/login", { email, password });
  return response.data; 
};

export const getAllUsers = async() => {
  const response = await API.get("/admin/users");
  return response.data;
}

export const getAllMentors = async() => {
  const response = await API.get("/admin/mentors");
  return response.data;
}