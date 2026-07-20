import type { ApiErrorBody } from "@/lib/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorBody & {
      errors?: Array<{ defaultMessage?: string; message?: string }>;
    };

    if (data.message) {
      return data.message;
    }

    if (data.errors?.length) {
      return data.errors
        .map((error) => error.defaultMessage ?? error.message)
        .filter(Boolean)
        .join(", ");
    }

    if (data.error) {
      return data.error;
    }
  } catch {
    // Fall through to status text.
  }

  return response.statusText || "Something went wrong";
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
