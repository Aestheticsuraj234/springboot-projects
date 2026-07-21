"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiClientError, api, type PhotoStatus } from "@/lib/api";
import { uploadPhotoFile } from "@/lib/photo-upload";
import { albumKeys, photoKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";
import { usePhotoSelectionStore } from "@/stores/photo-selection-store";

const PAGE_SIZE = 24;

export function usePhotos(status: PhotoStatus = "ACTIVE") {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useInfiniteQuery({
    queryKey: photoKeys.list(status),
    queryFn: ({ pageParam = 0 }) => api.getPhotos(accessToken!, status, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
    enabled: !!accessToken,
  });
}

export function useUploadPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      files,
      onFileProgress,
    }: {
      files: File[];
      onFileProgress?: (fileName: string, progress: number) => void;
    }) => {
      const results = [];
      for (const file of files) {
        const photo = await uploadPhotoFile(file, (progress) => {
          onFileProgress?.(file.name, progress);
        });
        results.push(photo);
      }
      return results;
    },
    onSuccess: (photos) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      toast.success(
        photos.length === 1 ? "Photo uploaded" : `${photos.length} photos uploaded`,
      );
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Upload failed";
      toast.error(message);
    },
  });
}

function usePhotoBulkMutation(
  mutationFn: (photoIds: string[]) => Promise<void>,
  successMessage: string,
) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const exitSelectMode = usePhotoSelectionStore((state) => state.exitSelectMode);

  return useMutation({
    mutationFn: (photoIds: string[]) => mutationFn(photoIds),
    onSuccess: (_, photoIds) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      exitSelectMode();
      toast.success(photoIds.length === 1 ? successMessage : `${photoIds.length} ${successMessage}`);
    },
    onError: (error) => {
      const message = error instanceof ApiClientError ? error.message : "Action failed";
      toast.error(message);
    },
  });
}

export function useArchivePhotos() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return usePhotoBulkMutation(
    (photoIds) => api.archivePhotos(accessToken!, photoIds),
    "photos archived",
  );
}

export function useTrashPhotos() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return usePhotoBulkMutation(
    (photoIds) => api.trashPhotos(accessToken!, photoIds),
    "photos moved to trash",
  );
}

export function useRestorePhotos() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return usePhotoBulkMutation(
    (photoIds) => api.restorePhotos(accessToken!, photoIds),
    "photos restored",
  );
}

export function usePermanentlyDeletePhotos() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return usePhotoBulkMutation(
    (photoIds) => api.permanentlyDeletePhotos(accessToken!, photoIds),
    "photos permanently deleted",
  );
}
