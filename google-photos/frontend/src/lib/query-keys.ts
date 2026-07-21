import type { PhotoStatus } from "@/lib/api";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const photoKeys = {
  all: ["photos"] as const,
  lists: () => [...photoKeys.all, "list"] as const,
  list: (status: PhotoStatus) => [...photoKeys.lists(), status] as const,
  detail: (photoId: string) => [...photoKeys.all, "detail", photoId] as const,
};

export const libraryKeys = {
  all: ["library"] as const,
  storage: () => [...libraryKeys.all, "storage"] as const,
  imagekitAssets: () => [...libraryKeys.all, "imagekit-assets"] as const,
};

export const albumKeys = {
  all: ["albums"] as const,
  lists: () => [...albumKeys.all, "list"] as const,
  detail: (albumId: string) => [...albumKeys.all, "detail", albumId] as const,
  photos: (albumId: string) => [...albumKeys.all, "photos", albumId] as const,
};
