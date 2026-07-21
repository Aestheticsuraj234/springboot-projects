"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiClientError, api } from "@/lib/api";
import { albumKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth-store";

const PAGE_SIZE = 24;

export function useAlbums() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: albumKeys.lists(),
    queryFn: () => api.getAlbums(accessToken!),
    enabled: !!accessToken,
  });
}

export function useAlbum(albumId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: albumKeys.detail(albumId),
    queryFn: () => api.getAlbum(accessToken!, albumId),
    enabled: !!accessToken && !!albumId,
  });
}

export function useAlbumPhotos(albumId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useInfiniteQuery({
    queryKey: albumKeys.photos(albumId),
    queryFn: ({ pageParam = 0 }) =>
      api.getAlbumPhotos(accessToken!, albumId, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
    enabled: !!accessToken && !!albumId,
  });
}

export function useCreateAlbum() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => api.createAlbum(accessToken!, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      toast.success("Album created");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.message : "Failed to create album";
      toast.error(message);
    },
  });
}

export function useDeleteAlbum() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (albumId: string) => api.deleteAlbum(accessToken!, albumId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      toast.success("Album deleted");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.message : "Failed to delete album";
      toast.error(message);
    },
  });
}

export function useAddPhotosToAlbum() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ albumId, photoIds }: { albumId: string; photoIds: string[] }) =>
      api.addPhotosToAlbum(accessToken!, albumId, photoIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.photos(variables.albumId) });
      toast.success("Photos added to album");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.message : "Failed to add photos to album";
      toast.error(message);
    },
  });
}

export function useRemovePhotoFromAlbum(albumId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => api.removePhotoFromAlbum(accessToken!, albumId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.photos(albumId) });
      toast.success("Photo removed from album");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError ? error.message : "Failed to remove photo from album";
      toast.error(message);
    },
  });
}
