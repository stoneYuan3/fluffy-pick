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

export const FoodStatus = z.enum(["normal", "active"]);
export type FoodStatus = z.infer<typeof FoodStatus>;

export const FoodCreateBody = z.object({
  name: z.string().trim().min(1, "Food requires a name").max(255),
  description: z.string().max(10_000).nullable().optional(),
  photos: z.array(z.string()).max(6, "Up to 6 photos per food"),
});

export const FoodDeleteBody = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(500),
});

export const FoodStatusBody = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(500),
  status: FoodStatus,
});

export const Locale = z.enum(["en", "zh-CN"]);
export type Locale = z.infer<typeof Locale>;

export const LocaleBody = z.object({ locale: Locale });

export const UpdateProfileBody = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(255).optional(),
    email: z.string().trim().toLowerCase().email("Valid email is required").max(255).optional(),
  })
  .refine((v) => v.name !== undefined || v.email !== undefined, {
    message: "At least one of name or email is required",
  });

export const ChangePasswordBody = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(200),
  newPassword: z.string().min(6, "New password must be at least 6 characters").max(200),
});