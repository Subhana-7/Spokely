import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  role: string | null;
  setToken: (token: string) => void;
  setRole: (role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: Cookies.get('token') || null,
  role: Cookies.get('role') || null,
  isAuthenticated: !!Cookies.get('token'),

  setToken: (token: string) => {
    Cookies.set('token', token, { expires: 7, secure: true });
    set({ token, isAuthenticated: true });
  },

  setRole: (role: string) => {
    Cookies.set('role', role, { expires: 7 });
    set({ role });
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('role');
    set({ token: null, role: null, isAuthenticated: false });
  }
}));
