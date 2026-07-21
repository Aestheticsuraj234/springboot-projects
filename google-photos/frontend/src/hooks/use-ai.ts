"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiClientError, api, type AiTransformRequest } from "@/lib/api";
import { libraryKeys, photoKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";

export function usePhoto(photoId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: photoKeys.detail(photoId),
    queryFn: () => api.getPhoto(accessToken!, photoId),
    enabled: !!accessToken && !!photoId,
  });
}

export function useAiPreview(photoId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: (body: AiTransformRequest) => api.previewAiTransform(accessToken!, photoId, body),
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.message : "Preview failed";
      toast.error(message);
    },
  });
}

export function useAiApply(photoId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AiTransformRequest) => api.applyAiTransform(accessToken!, photoId, body),
    onSuccess: (photo) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      queryClient.invalidateQueries({ queryKey: libraryKeys.storage() });
      toast.success("AI edit saved as a new photo");
      return photo;
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.message : "Failed to apply AI edit";
      toast.error(message);
    },
  });
}

export function useImportImageKitAssets() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imagekitFileIds: string[]) =>
      api.importImageKitAssets(accessToken!, imagekitFileIds),
    onSuccess: (photos) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      queryClient.invalidateQueries({ queryKey: libraryKeys.all });
      toast.success(`${photos.length} photo${photos.length === 1 ? "" : "s"} imported`);
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.message : "Import failed";
      toast.error(message);
    },
  });
}
