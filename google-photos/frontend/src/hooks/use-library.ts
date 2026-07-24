"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { libraryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";

export function useStorageUsage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: libraryKeys.storage(),
    queryFn: () => api.getStorageUsage(),
    enabled: !!accessToken,
  });
}

export function useImageKitAssets() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: libraryKeys.imagekitAssets(),
    queryFn: () => api.getImageKitAssets(),
    enabled: !!accessToken,
  });
}
