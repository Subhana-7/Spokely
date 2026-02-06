import { create } from "zustand";
import Cookies from "js-cookie";

interface User {
  id: string;
  name?: string;
  email: string;
  role: "user" | "mentor" | "admin";
  uniqueCode?: string;
  profilePicture?: string;
  phone?: number;
  bio?: string;
  level?: number;
  tags?: string[];
  isBlocked?: boolean;
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
    console.log("Setting user in store:", user);

    const normalizedUser = {
      ...user,
      tags: Array.isArray(user.tags) ? user.tags : [],
    };

    Cookies.set("role", normalizedUser.role, { sameSite: "none" });
    set({ user: normalizedUser, isAuthenticated: !normalizedUser.isBlocked });

    console.log("User stored in Zustand:", normalizedUser);
  },
  logout: () => {
     Cookies.remove("role");
    set({ user: null, isAuthenticated: false });
  },
}));
