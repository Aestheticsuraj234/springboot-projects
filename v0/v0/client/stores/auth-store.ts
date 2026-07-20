"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthResponse } from "@/lib/types/auth";

interface AuthState {
  accessToken: string | null;
  tokenType: string;
  expiresAt: number | null;
  email: string | null;
  username: string | null;
  isAuthenticated: boolean;
  setAuth: (
    response: AuthResponse,
    profile?: { email?: string; username?: string },
  ) => void;
  clearAuth: () => void;
}

function decodeJwtEmail(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { sub?: string };

    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

const initialState = {
  accessToken: null,
  tokenType: "Bearer",
  expiresAt: null,
  email: null,
  username: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (response, profile) => {
        const email =
          profile?.email ?? decodeJwtEmail(response.accessToken) ?? null;

        set({
          accessToken: response.accessToken,
          tokenType: response.tokenType,
          expiresAt: Date.now() + response.expiresIn * 1000,
          email,
          username: profile?.username ?? null,
          isAuthenticated: true,
        });
      },
      clearAuth: () => set(initialState),
    }),
    {
      name: "v0-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        tokenType: state.tokenType,
        expiresAt: state.expiresAt,
        email: state.email,
        username: state.username,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
