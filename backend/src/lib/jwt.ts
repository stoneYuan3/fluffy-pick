import jwt from "jsonwebtoken";
import type { Locale } from "./schemas.js";

const SECRET = process.env["JWT_SECRET"];
if (!SECRET) throw new Error("JWT_SECRET is not set");

const EXPIRES_IN = "7d";

export interface TokenPayload {
  userId: number;
  locale: Locale;
}

export function signToken(userId: number, locale: Locale): string {
  return jwt.sign({ userId, locale }, SECRET as string, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, SECRET as string);
  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "number" ||
    (decoded.locale !== "en" && decoded.locale !== "zh-CN")
  ) {
    throw new Error("Invalid token payload");
  }
  return { userId: decoded.userId, locale: decoded.locale };
}