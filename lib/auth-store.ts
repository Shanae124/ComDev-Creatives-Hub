import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  restoreSession: () => void;
  impersonating: boolean;
  originalUser: User | null;
  startImpersonation: (impersonated: User, token: string) => void;
  stopImpersonation: (token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      impersonating: false,
      originalUser: null,

      setAuth: (user: User, token: string) => {
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('token', token); } catch {}
        }
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          try { localStorage.removeItem('token'); } catch {}
        }
        set({ user: null, token: null, isAuthenticated: false, impersonating: false, originalUser: null });
      },

      restoreSession: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            set({ token, isAuthenticated: true });
          }
        }
      },

      startImpersonation: (impersonated: User, token: string) => {
        const currentUser = get().user;
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('token', token); } catch {}
        }
        set({ user: impersonated, token, isAuthenticated: true, impersonating: true, originalUser: currentUser || null });
      },

      stopImpersonation: (token: string) => {
        const original = get().originalUser;
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('token', token); } catch {}
        }
        set({ user: original, token, isAuthenticated: true, impersonating: false, originalUser: null });
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
