export interface AuthResponse {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  status?: number;
}
