import { apiClient } from "@/lib/api/client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/lib/types/auth";

export function loginRequest(data: LoginRequest) {
  return apiClient<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: data,
  });
}

export function registerRequest(data: RegisterRequest) {
  return apiClient<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: data,
  });
}
