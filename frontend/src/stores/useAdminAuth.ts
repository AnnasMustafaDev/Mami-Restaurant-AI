import { create } from 'zustand';
import { adminLogin } from '../services/api';

interface AdminAuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuthState>((set) => ({
  token: localStorage.getItem('admin_token'),
  isAuthenticated: !!localStorage.getItem('admin_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { access_token } = await adminLogin(email, password);
      localStorage.setItem('admin_token', access_token);
      set({ token: access_token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Login failed',
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ token: null, isAuthenticated: false });
  },
}));
