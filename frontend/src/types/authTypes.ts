export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "user" | "mentor";
}

export interface LoginData {
  email: string;
  password: string;
  role: "user" | "mentor";
}
