import { get, post } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  OtpVerifyRequest,
  RegisterRequest,
} from "./types";

export function register(data: RegisterRequest) {
  return post<{ id: string; message: string }>("/auth/register", data);
}

export function verifyOtp(data: OtpVerifyRequest) {
  return post<AuthResponse>("/auth/verify-otp", data);
}

export function login(data: LoginRequest) {
  return post<AuthResponse>("/auth/login", data);
}

export function refreshToken(token: string) {
  return post<{ accessToken: string }>("/auth/refresh", { refreshToken: token });
}

export function resendOtp(phone: string) {
  return post<{ message: string }>("/auth/resend-otp", { phone });
}
