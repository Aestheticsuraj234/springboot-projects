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
  status: "ACTIVE" | "ARCHIVED" | "TRASH";
  createdAt: string;
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

  getPhotos: (accessToken: string, page = 0, size = 24) =>
    request<PageResponse<Photo>>(`/photos?page=${page}&size=${size}`, {}, accessToken),

  uploadPhoto: (accessToken: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<Photo>("/photos/upload", { method: "POST", body: formData }, accessToken);
  },

  importPhoto: (accessToken: string, body: CreatePhotoPayload) =>
    request<Photo>("/photos", { method: "POST", body: JSON.stringify(body) }, accessToken),

  deletePhoto: (accessToken: string, photoId: string) =>
    request<void>(`/photos/${photoId}`, { method: "DELETE" }, accessToken),
};
