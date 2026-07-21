const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

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

export type CreatePhotoPayload = {
  imagekitFileId: string;
  fileName: string;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  sizeBytes: number;
  width?: number;
  height?: number;
};

export type ApiError = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
};

export class ApiClientError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function parseError(response: Response): Promise<ApiClientError> {
  try {
    const body = (await response.json()) as ApiError;
    return new ApiClientError(body.message ?? "Request failed", response.status, body.fieldErrors);
  } catch {
    return new ApiClientError("Request failed", response.status);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (body: { email: string; password: string; displayName: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  refresh: (refreshToken: string) =>
    request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (refreshToken: string) =>
    request<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  me: (accessToken: string) => request<User>("/auth/me", {}, accessToken),

  getPhoto: (accessToken: string, photoId: string) =>
    request<Photo>(`/photos/${photoId}`, {}, accessToken),

  getPhotos: (accessToken: string, status: PhotoStatus = "ACTIVE", page = 0, size = 24) =>
    request<PageResponse<Photo>>(
      `/photos?status=${status}&page=${page}&size=${size}`,
      {},
      accessToken,
    ),

  uploadPhoto: (accessToken: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<Photo>("/photos/upload", { method: "POST", body: formData }, accessToken);
  },

  importPhoto: (accessToken: string, body: CreatePhotoPayload) =>
    request<Photo>("/photos", { method: "POST", body: JSON.stringify(body) }, accessToken),

  archivePhotos: (accessToken: string, photoIds: string[]) =>
    request<void>(
      "/photos/archive",
      { method: "POST", body: JSON.stringify({ photoIds }) },
      accessToken,
    ),

  trashPhotos: (accessToken: string, photoIds: string[]) =>
    request<void>(
      "/photos/trash",
      { method: "POST", body: JSON.stringify({ photoIds }) },
      accessToken,
    ),

  restorePhotos: (accessToken: string, photoIds: string[]) =>
    request<void>(
      "/photos/restore",
      { method: "POST", body: JSON.stringify({ photoIds }) },
      accessToken,
    ),

  permanentlyDeletePhotos: (accessToken: string, photoIds: string[]) =>
    request<void>(
      "/photos/delete-permanent",
      { method: "POST", body: JSON.stringify({ photoIds }) },
      accessToken,
    ),

  deletePhoto: (accessToken: string, photoId: string) =>
    request<void>(`/photos/${photoId}`, { method: "DELETE" }, accessToken),

  getAlbums: (accessToken: string) => request<Album[]>("/albums", {}, accessToken),

  getAlbum: (accessToken: string, albumId: string) =>
    request<Album>(`/albums/${albumId}`, {}, accessToken),

  createAlbum: (accessToken: string, body: { title: string }) =>
    request<Album>("/albums", { method: "POST", body: JSON.stringify(body) }, accessToken),

  updateAlbum: (
    accessToken: string,
    albumId: string,
    body: { title?: string; coverPhotoId?: string },
  ) =>
    request<Album>(`/albums/${albumId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }, accessToken),

  deleteAlbum: (accessToken: string, albumId: string) =>
    request<void>(`/albums/${albumId}`, { method: "DELETE" }, accessToken),

  getAlbumPhotos: (accessToken: string, albumId: string, page = 0, size = 24) =>
    request<PageResponse<Photo>>(
      `/albums/${albumId}/photos?page=${page}&size=${size}`,
      {},
      accessToken,
    ),

  addPhotosToAlbum: (accessToken: string, albumId: string, photoIds: string[]) =>
    request<void>(
      `/albums/${albumId}/photos`,
      { method: "POST", body: JSON.stringify({ photoIds }) },
      accessToken,
    ),

  removePhotoFromAlbum: (accessToken: string, albumId: string, photoId: string) =>
    request<void>(`/albums/${albumId}/photos/${photoId}`, { method: "DELETE" }, accessToken),

  previewAiTransform: (accessToken: string, photoId: string, body: AiTransformRequest) =>
    request<AiTransformPreviewResponse>(
      `/photos/${photoId}/ai/preview`,
      { method: "POST", body: JSON.stringify(body) },
      accessToken,
    ),

  applyAiTransform: (accessToken: string, photoId: string, body: AiTransformRequest) =>
    request<Photo>(
      `/photos/${photoId}/ai/apply`,
      { method: "POST", body: JSON.stringify(body) },
      accessToken,
    ),

  getStorageUsage: (accessToken: string) =>
    request<StorageUsageResponse>("/library/storage", {}, accessToken),

  getImageKitAssets: (accessToken: string) =>
    request<ImageKitAsset[]>("/library/imagekit-assets", {}, accessToken),

  importImageKitAssets: (accessToken: string, imagekitFileIds: string[]) =>
    request<Photo[]>(
      "/library/import",
      { method: "POST", body: JSON.stringify({ imagekitFileIds }) },
      accessToken,
    ),
};
