import { post } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  OtpVerifyRequest,
  RegisterRequest,
  RegisterResponse,
} from "./types";

export const authApi = {
  register: (data: RegisterRequest) =>
    post<RegisterResponse>("/auth/register", data),

  verifyOtp: (data: OtpVerifyRequest) =>
    post<AuthResponse>("/auth/verify-otp", data),

  login: (data: LoginRequest) =>
    post<AuthResponse>("/auth/login", data),

  refreshToken: (refreshToken: string) =>
    post<{ accessToken: string }>("/auth/refresh", { refreshToken }),

  resendOtp: (phone: string) =>
    post<void>("/auth/resend-otp", { phone }),
};

// Legacy named exports
export const register = authApi.register;
export const verifyOtp = authApi.verifyOtp;
export const login = authApi.login;
export const refreshToken = authApi.refreshToken;
export const resendOtp = authApi.resendOtp;
