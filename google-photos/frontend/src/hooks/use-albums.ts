"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { albumKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";

const PAGE_SIZE = 24;

export function useAlbums() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: albumKeys.lists(),
    queryFn: () => api.getAlbums(),
    enabled: !!accessToken,
  });
}

export function useAlbum(albumId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: albumKeys.detail(albumId),
    queryFn: () => api.getAlbum(albumId),
    enabled: !!accessToken && !!albumId,
  });
}

export function useAlbumPhotos(albumId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useInfiniteQuery({
    queryKey: albumKeys.photos(albumId),
    queryFn: ({ pageParam = 0 }) => api.getAlbumPhotos(albumId, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
    enabled: !!accessToken && !!albumId,
  });
}

export function useCreateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => api.createAlbum(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      toast.success("Album created");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create album");
    },
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (albumId: string) => api.deleteAlbum(albumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      toast.success("Album deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete album");
    },
  });
}

export function useAddPhotosToAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ albumId, photoIds }: { albumId: string; photoIds: string[] }) =>
      api.addPhotosToAlbum(albumId, photoIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.photos(variables.albumId) });
      toast.success("Photos added to album");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add photos to album");
    },
  });
}

export function useRemovePhotoFromAlbum(albumId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => api.removePhotoFromAlbum(albumId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.photos(albumId) });
      toast.success("Photo removed from album");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove photo from album");
    },
  });
}
