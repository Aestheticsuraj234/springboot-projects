import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Email must be valid")
    .max(255, "Email must not exceed 255 characters"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Email must be valid")
    .max(255, "Email must not exceed 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
