import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AdminAuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  token: Cookies.get("admin-token") || null,
  isAuthenticated: !!Cookies.get("admin-token"),

  setToken: (token: string) => {
    Cookies.set("admin-token", token, { expires: 7, secure: true });
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove("admin-token");
    set({ token: null, isAuthenticated: false });
  },
}));
