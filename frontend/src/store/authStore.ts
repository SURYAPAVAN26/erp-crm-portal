import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  login: (user, token) => {
    localStorage.setItem("erp_token", token);
    localStorage.setItem("erp_user", JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
    set({ user: null, token: null });
  },

  hydrate: () => {
    const token = localStorage.getItem("erp_token");
    const userRaw = localStorage.getItem("erp_user");
    if (token && userRaw) {
      try {
        set({ user: JSON.parse(userRaw), token, isHydrated: true });
        return;
      } catch {
        // fall through to clear
      }
    }
    set({ isHydrated: true });
  },
}));
