import { create } from "zustand";
import Cookies from "js-cookie";

interface User {
  id: string;
  name?: string;
  email: string;
  role: "user" | "mentor" | "admin";
  uniqueCode?: string;
  profilePicture?: string;
  phone?:number;
  bio?:string;
  level?:number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => {
    console.log(user);
    Cookies.set("role", user.role, { sameSite: "Lax" });
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove("role");
    set({ user: null, isAuthenticated: false });
  },
}));
