"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { loginRequest, registerRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { LoginFormValues, RegisterFormValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/stores/auth-store";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function useLoginMutation() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginFormValues) => loginRequest(data),
    onSuccess: (response, variables) => {
      setAuth(response, { email: variables.email });
      toast.success("Welcome back!");
      router.push("/");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Invalid email or password"));
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: RegisterFormValues) => registerRequest(data),
    onSuccess: (response, variables) => {
      setAuth(response, {
        email: variables.email,
        username: variables.username,
      });
      toast.success("Account created successfully");
      router.push("/");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to create account"));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return () => {
    clearAuth();
    toast.success("Signed out");
    router.push("/login");
  };
}
