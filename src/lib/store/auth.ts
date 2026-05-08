"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { AuthResponse, LoginRequest, OtpVerifyRequest, RegisterRequest, UserDto } from "@/lib/api/types";

// User type that mirrors UserDto (used by legacy pages)
export type User = UserDto;

interface AuthStore {
  user: UserDto | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // MD-spec actions
  setAuth: (response: AuthResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: UserDto) => void;

  // Legacy actions used by existing pages
  login: (user: UserDto, token: string, refreshToken?: string) => void;
  apiRegister: (data: RegisterRequest) => Promise<{ userId?: string; id?: string; message: string }>;
  apiVerifyOtp: (data: OtpVerifyRequest) => Promise<void>;
  apiLogin: (data: LoginRequest) => Promise<void>;
}

// Zustand v5 persist passes the state as a plain object to setItem (not pre-stringified).
// We must JSON.stringify it ourselves before writing to the cookie, and JSON.parse on read.
const cookieStorage = {
  getItem: (name: string): unknown => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    if (!match) return null;
    try { return JSON.parse(decodeURIComponent(match[2])); } catch { return null; }
  },
  setItem: (name: string, value: unknown): void => {
    if (typeof document === "undefined") return;
    const str = typeof value === "string" ? value : JSON.stringify(value);
    document.cookie = `${name}=${encodeURIComponent(str)};path=/;max-age=604800;samesite=lax`;
  },
  removeItem: (name: string): void => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=;path=/;max-age=0`;
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (response) =>
        set({
          user: response.user,
          token: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ token: accessToken, refreshToken }),

      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),

      updateUser: (user) => set({ user }),

      // Legacy: matches old `login(user, token, refreshToken)` signature
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken: refreshToken ?? null, isAuthenticated: true }),

      apiRegister: async (data) => {
        const { authApi } = await import("@/lib/api/auth");
        return authApi.register(data);
      },

      apiVerifyOtp: async (data) => {
        const { authApi } = await import("@/lib/api/auth");
        const res = await authApi.verifyOtp(data);
        set({
          user: res.user,
          token: res.accessToken,
          refreshToken: res.refreshToken,
          isAuthenticated: true,
        });
      },

      apiLogin: async (data) => {
        const { authApi } = await import("@/lib/api/auth");
        const res = await authApi.login(data);
        set({
          user: res.user,
          token: res.accessToken,
          refreshToken: res.refreshToken,
          isAuthenticated: true,
        });
      },
    }),
    { name: "souk-auth", storage: cookieStorage }
  )
);

// ── Selectors ──────────────────────────────────────────────
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useIsVendor = () => useAuthStore((s) => s.user?.role === "VENDOR");
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === "ADMIN");

export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
