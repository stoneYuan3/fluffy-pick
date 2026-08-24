import { z } from "zod";

export const User = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable(),
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
