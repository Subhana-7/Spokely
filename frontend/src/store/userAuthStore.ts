import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  role: string | null;
  setRole: (role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: Cookies.get('auth-token') || null,  // Only read, don't set
  role: Cookies.get('role') || null,
  isAuthenticated: !!Cookies.get('auth-token'),

  setRole: (role: string) => {
    Cookies.set('role', role, { expires: 7 });
    set({ role });
  },

  logout: () => {
    Cookies.remove('role'); // ✅ Only manage role
    set({ role: null, token: null, isAuthenticated: false });
  },
}));
