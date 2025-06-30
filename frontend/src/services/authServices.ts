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

export const login = (data: { email: string; password: string }) => API.post("/login", data);

export const sendOTP = (data: {email:string}) => API.post("/send-otp",data);

export const verifyOTP = (data:{email:string,code:string}) => API.post("/verify-otp",data);

//temperory since auth is still pending
export const setRole = async (role: "user" | "mentor") => {
  const token = localStorage.getItem("spokely_token");
  const userId = localStorage.getItem("spokely_user_id"); 

  return API.patch(
    "/update-role",
    { role, id: userId }, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};


