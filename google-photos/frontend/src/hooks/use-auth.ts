"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiClientError, api } from "@/lib/api";
import { authKeys } from "@/lib/query-keys";
import type { LoginFormValues, RegisterFormValues } from "@/lib/validations/auth";
import { selectIsAuthenticated, useAuthStore } from "@/stores/auth-store";

function handleAuthError(
  error: unknown,
  setFieldError?: (field: string, message: string) => void,
) {
  if (error instanceof ApiClientError) {
    if (error.fieldErrors && setFieldError) {
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        setFieldError(field, message);
      });
    }
    toast.error(error.message);
    return;
  }

  toast.error("Something went wrong. Please try again.");
}

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const cachedUser = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => api.me(accessToken!),
    enabled: !!accessToken,
    initialData: cachedUser ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin(options?: {
  setFieldError?: (field: string, message: string) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (values: LoginFormValues) => api.login(values),
    onSuccess: (data) => {
      setAuth(data);
      queryClient.setQueryData(authKeys.me(), data.user);
      toast.success(`Welcome back, ${data.user.displayName}`);
      router.replace("/photos");
    },
    onError: (error) => handleAuthError(error, options?.setFieldError),
  });
}

export function useRegister(options?: {
  setFieldError?: (field: string, message: string) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (values: RegisterFormValues) => api.register(values),
    onSuccess: (data) => {
      setAuth(data);
      queryClient.setQueryData(authKeys.me(), data.user);
      toast.success("Account created successfully");
      router.replace("/photos");
    },
    onError: (error) => handleAuthError(error, options?.setFieldError),
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await api.logout(refreshToken);
      }
    },
    onSettled: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: authKeys.all });
      toast.success("Signed out");
      router.replace("/login");
    },
  });
}

export function useAuthSession() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  return {
    hasHydrated,
    isAuthenticated,
  };
}
