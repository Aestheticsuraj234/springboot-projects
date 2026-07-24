"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { authKeys } from "@/lib/query-keys";
import type { LoginFormValues, RegisterFormValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/stores/auth-store";

/** Current user from the API (only runs when logged in). */
export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const cachedUser = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => api.me(),
    enabled: !!accessToken,
    initialData: cachedUser ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}

/** Login → save tokens → go to /photos */
export function useLogin() {
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
  });
}

/** Register → save tokens → go to /photos */
export function useRegister() {
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
  });
}

/** Logout → clear tokens → go to /login */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => api.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: authKeys.all });
      toast.success("Signed out");
      router.replace("/login");
    },
  });
}

/** Simple auth status for guards and redirects. */
export function useAuth() {
  const isReady = useAuthStore((state) => state.isReady);
  const accessToken = useAuthStore((state) => state.accessToken);

  return {
    isReady,
    isLoggedIn: !!accessToken,
  };
}
