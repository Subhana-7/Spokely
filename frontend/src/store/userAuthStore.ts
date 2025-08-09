import { create } from "zustand";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "mentor";
  uniqueCode:string;
  profilePicture:string;
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
    console.log(user)
    set({ user, isAuthenticated: true });
  },


  logout: () => {
    Cookies.remove("role");
    set({ user: null, isAuthenticated: false });
  },
}));