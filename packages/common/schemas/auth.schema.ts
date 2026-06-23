import { z } from "zod";

// ─── Sign In ──────────────────────────────────────────────────────

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

// ─── Sign Up ──────────────────────────────────────────────────────

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256, "Password must be at most 256 characters"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
