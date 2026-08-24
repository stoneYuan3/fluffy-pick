import { z } from "zod";

export const SignupBody = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().toLowerCase().email("Valid email is required").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(200),
});

export const LoginBody = z.object({
  username: z.string().trim().min(1, "Username is required").max(255),
  password: z.string().min(1, "Password is required").max(200),
});

export const CharaCreateItem = z.object({
  name: z.string().trim().min(1, "Each chara requires a name").max(255),
  avatar: z.string().nullable(),
});

export const CharaCreateBody = z.object({
  charas: z.array(CharaCreateItem).min(1, "charas must be a non-empty array").max(100),
});

export const CommitBody = z.object({
  ids: z.array(z.number().int().positive()).min(1, "ids must be a non-empty array of integers").max(500),
});