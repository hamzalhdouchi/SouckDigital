"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginRequest, OtpVerifyRequest, RegisterRequest } from "@/lib/api/types";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  avatar?: string | null;
  role: "BUYER" | "VENDOR" | "ADMIN";
  isVerified: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  apiRegister: (data: RegisterRequest) => Promise<{ id: string; message: string }>;
  apiVerifyOtp: (data: OtpVerifyRequest) => Promise<void>;
  apiLogin: (data: LoginRequest) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken: refreshToken ?? null, isAuthenticated: true }),

      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),

      updateUser: (data) =>
        set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),

      apiRegister: async (data) => {
        const { register } = await import("@/lib/api/auth");
        return register(data);
      },

      apiVerifyOtp: async (data) => {
        const { verifyOtp } = await import("@/lib/api/auth");
        const res = await verifyOtp(data);
        const user: User = {
          id:          res.user.id,
          firstName:   res.user.firstName,
          lastName:    res.user.lastName,
          email:       res.user.email,
          phone:       res.user.phone,
          role:        res.user.role,
          isVerified:  res.user.verified,
          avatar:      res.user.avatarUrl,
        };
        set({ user, token: res.accessToken, refreshToken: res.refreshToken, isAuthenticated: true });
      },

      apiLogin: async (data) => {
        const { login } = await import("@/lib/api/auth");
        const res = await login(data);
        const user: User = {
          id:          res.user.id,
          firstName:   res.user.firstName,
          lastName:    res.user.lastName,
          email:       res.user.email,
          phone:       res.user.phone,
          role:        res.user.role,
          isVerified:  res.user.verified,
          avatar:      res.user.avatarUrl,
        };
        set({ user, token: res.accessToken, refreshToken: res.refreshToken, isAuthenticated: true });
      },
    }),
    { name: "souk-auth" }
  )
);
