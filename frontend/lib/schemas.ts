import { z } from "zod";

export const Locale = z.enum(["en", "zh-CN"]);
export type Locale = z.infer<typeof Locale>;

export const User = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
  locale: Locale,
  hasCards: z.boolean(),
});
export type User = z.infer<typeof User>;

export const AuthResponse = z.object({
  token: z.string(),
  user: User,
});
export type AuthResponse = z.infer<typeof AuthResponse>;

export const MeResponse = z.object({ user: User });
export type MeResponse = z.infer<typeof MeResponse>;

export const UpdateProfileResponse = MeResponse;
export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponse>;

export const UpdateLocaleResponse = z.object({ token: z.string(), user: User });
export type UpdateLocaleResponse = z.infer<typeof UpdateLocaleResponse>;

export const ChangePasswordResponse = z.object({ ok: z.literal(true) });
export type ChangePasswordResponse = z.infer<typeof ChangePasswordResponse>;

export const Chara = z.object({
  id: z.number().int(),
  name: z.string(),
  avatar: z.string().nullable(),
  state: z.enum(["active", "standby"]),
});
export type Chara = z.infer<typeof Chara>;

export const CharaListResponse = z.object({
  charas: z.array(Chara),
});
export type CharaListResponse = z.infer<typeof CharaListResponse>;

export const CharaCreateResponse = z.object({
  charas: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
      avatar: z.string().nullable(),
    }),
  ),
});
export type CharaCreateResponse = z.infer<typeof CharaCreateResponse>;

export const CommitResponse = z.object({
  count: z.number().int().nonnegative(),
});
export type CommitResponse = z.infer<typeof CommitResponse>;

export const FoodStatus = z.enum(["normal", "active"]);
export type FoodStatus = z.infer<typeof FoodStatus>;

export const Food = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  photos: z.array(z.string()),
  status: FoodStatus,
  lastActiveAt: z.string().nullable(),
  activeNumber: z.number().int(),
  createdDate: z.string(),
});
export type Food = z.infer<typeof Food>;

export const FoodListResponse = z.object({ foods: z.array(Food) });
export type FoodListResponse = z.infer<typeof FoodListResponse>;

export const FoodCreateResponse = z.object({ food: Food });
export type FoodCreateResponse = z.infer<typeof FoodCreateResponse>;
