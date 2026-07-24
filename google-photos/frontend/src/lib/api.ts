import { useAuthStore } from "@/stores/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

// --- Types (match backend responses) ---

export type User = {
  id: string;
  email: string;
  displayName: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type PhotoStatus = "ACTIVE" | "ARCHIVED" | "TRASH";

export type AiTransformType =
  | "REMOVE_BACKGROUND"
  | "BACKGROUND_AND_SHADOW"
  | "CHANGE_BACKGROUND"
  | "GENERATIVE_FILL"
  | "SMART_CROP"
  | "OBJECT_CROP"
  | "RETOUCH"
  | "UPSCALE"
  | "AI_EDIT";

export type Photo = {
  id: string;
  imagekitFileId: string;
  fileName: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  status: PhotoStatus;
  createdAt: string;
  deletedAt: string | null;
  parentPhotoId: string | null;
  aiTransformType: AiTransformType | null;
};

export type AiTransformRequest = {
  type: AiTransformType;
  prompt?: string;
  width?: number;
  height?: number;
  focusObject?: string;
};

export type AiTransformPreviewResponse = {
  previewUrl: string;
  type: AiTransformType;
  transformChain: string;
};

export type StorageUsageResponse = {
  libraryUsedBytes: number;
  libraryPhotoCount: number;
  imagekitBandwidthBytes: number | null;
  imagekitStorageBytes: number | null;
};

export type ImageKitAsset = {
  fileId: string;
  fileName: string;
  url: string;
  thumbnailUrl: string | null;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  alreadyImported: boolean;
};

export type Album = {
  id: string;
  title: string;
  coverPhotoId: string | null;
  coverThumbnailUrl: string | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

// --- Tiny fetch helper ---

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    // Try to read { message } from the backend; otherwise use a generic error
    let message = "Request failed";
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// --- API methods ---

export const api = {
  // Auth (no token needed)
  register: (body: { email: string; password: string; displayName: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }, false),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }, false),

  logout: () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    return request<void>(
      "/auth/logout",
      { method: "POST", body: JSON.stringify({ refreshToken }) },
      false,
    );
  },

  me: () => request<User>("/auth/me"),

  // Photos
  getPhoto: (photoId: string) => request<Photo>(`/photos/${photoId}`),

  getPhotos: (status: PhotoStatus = "ACTIVE", page = 0, size = 24) =>
    request<PageResponse<Photo>>(`/photos?status=${status}&page=${page}&size=${size}`),

  archivePhotos: (photoIds: string[]) =>
    request<void>("/photos/archive", { method: "POST", body: JSON.stringify({ photoIds }) }),

  trashPhotos: (photoIds: string[]) =>
    request<void>("/photos/trash", { method: "POST", body: JSON.stringify({ photoIds }) }),

  restorePhotos: (photoIds: string[]) =>
    request<void>("/photos/restore", { method: "POST", body: JSON.stringify({ photoIds }) }),

  permanentlyDeletePhotos: (photoIds: string[]) =>
    request<void>("/photos/delete-permanent", {
      method: "POST",
      body: JSON.stringify({ photoIds }),
    }),

  // Albums
  getAlbums: () => request<Album[]>("/albums"),

  getAlbum: (albumId: string) => request<Album>(`/albums/${albumId}`),

  createAlbum: (title: string) =>
    request<Album>("/albums", { method: "POST", body: JSON.stringify({ title }) }),

  deleteAlbum: (albumId: string) =>
    request<void>(`/albums/${albumId}`, { method: "DELETE" }),

  getAlbumPhotos: (albumId: string, page = 0, size = 24) =>
    request<PageResponse<Photo>>(`/albums/${albumId}/photos?page=${page}&size=${size}`),

  addPhotosToAlbum: (albumId: string, photoIds: string[]) =>
    request<void>(`/albums/${albumId}/photos`, {
      method: "POST",
      body: JSON.stringify({ photoIds }),
    }),

  removePhotoFromAlbum: (albumId: string, photoId: string) =>
    request<void>(`/albums/${albumId}/photos/${photoId}`, { method: "DELETE" }),

  // AI
  previewAiTransform: (photoId: string, body: AiTransformRequest) =>
    request<AiTransformPreviewResponse>(`/photos/${photoId}/ai/preview`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  applyAiTransform: (photoId: string, body: AiTransformRequest) =>
    request<Photo>(`/photos/${photoId}/ai/apply`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Library
  getStorageUsage: () => request<StorageUsageResponse>("/library/storage"),

  getImageKitAssets: () => request<ImageKitAsset[]>("/library/imagekit-assets"),

  importImageKitAssets: (imagekitFileIds: string[]) =>
    request<Photo[]>("/library/import", {
      method: "POST",
      body: JSON.stringify({ imagekitFileIds }),
    }),
};
