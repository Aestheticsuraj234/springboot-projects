"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiClientError, api } from "@/lib/api";
import { uploadPhotoFile } from "@/lib/photo-upload";
import { photoKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";

const PAGE_SIZE = 24;

export function usePhotos() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useInfiniteQuery({
    queryKey: photoKeys.lists(),
    queryFn: ({ pageParam = 0 }) => api.getPhotos(accessToken!, pageParam, PAGE_SIZE),
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

export function useDeletePhoto() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => api.deletePhoto(accessToken!, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
      toast.success("Photo deleted");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.message : "Failed to delete photo";
      toast.error(message);
    },
  });
}
