"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type AiTransformRequest } from "@/lib/api";
import { libraryKeys, photoKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";

export function usePhoto(photoId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: photoKeys.detail(photoId),
    queryFn: () => api.getPhoto(photoId),
    enabled: !!accessToken && !!photoId,
  });
}

export function useAiPreview(photoId: string) {
  return useMutation({
    mutationFn: (body: AiTransformRequest) => api.previewAiTransform(photoId, body),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Preview failed");
    },
  });
}

export function useAiApply(photoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AiTransformRequest) => api.applyAiTransform(photoId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      queryClient.invalidateQueries({ queryKey: libraryKeys.storage() });
      toast.success("AI edit saved as a new photo");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to apply AI edit");
    },
  });
}

export function useImportImageKitAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imagekitFileIds: string[]) => api.importImageKitAssets(imagekitFileIds),
    onSuccess: (photos) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      queryClient.invalidateQueries({ queryKey: libraryKeys.all });
      toast.success(`${photos.length} photo${photos.length === 1 ? "" : "s"} imported`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Import failed");
    },
  });
}
