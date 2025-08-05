import { create } from "zustand";
import { login, signup, logoutService } from "../services/authServices";
import Cookies from "js-cookie";
import type { SignupData } from "../types/authTypes";
import type { User } from "../types/userTypes";

// ✅ Define allowed roles
type Role = "user" | "mentor";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  signup: (signupData: SignupData) => Promise<any>;
  login: (email: string, password: string, role: Role) => Promise<any>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
  hydrationComplete: boolean;

}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  role: null,
  hydrationComplete: false,


  signup: async (signupData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await signup(signupData);
      set({
        user: response.data.user,
        isAuthenticated: true,
        role: Cookies.get("role") as Role || null,
        isLoading: false,
      });
      return response;
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          `${signupData.role} signup failed. Please try again.`,
      });
      throw error;
    }
  },

  login: async (email, password, role) => {
    try {
      set({ isLoading: true, error: null });
      const response = await login({ email, password }, role);
      set({
        user: response.data.user,
        isAuthenticated: true,
        role: Cookies.get("role") as Role || null,
        isLoading: false,
      });
      return response;
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          `${role} login failed. Please try again.`,
      });
      throw error;
    }
  },

  logout: async () => {
    const role = Cookies.get("role");

    // ✅ Only call logoutService for valid roles
    if (role === "user" || role === "mentor") {
      await logoutService(role);
    } else {
      console.warn(`Skipping logoutService for unsupported role: ${role}`);
    }

    Cookies.remove("auth-token");
    Cookies.remove("refresh-token");
    Cookies.remove("role");

    set({
      user: null,
      isAuthenticated: false,
      role: null,
    });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  initializeAuth: async () => {
  try {
    const token = Cookies.get("auth-token");
    if (token) {
      const response = await fetch("/api/users/home", {
        credentials: "include",
      });
      const user = await response.json();
      set({
        user,
        isAuthenticated: true,
        role: Cookies.get("role") as Role || null,
        hydrationComplete: true,
      });
    } else {
      set({ user: null, isAuthenticated: false, role: null, hydrationComplete: true });
    }
  } catch {
    set({ user: null, isAuthenticated: false, role: null, hydrationComplete: true });
  }
},

}));
