import { z } from 'zod';

export const googleAuthSchema = z.object({
  idToken: z.string().min(10),
});

export const registerSchema = z.object({
  displayName: z.string().min(2).max(60),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/i, 'Solo letras, números y guion bajo'),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
