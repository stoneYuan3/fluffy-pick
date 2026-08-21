import jwt from "jsonwebtoken";

const SECRET = process.env["JWT_SECRET"];
if (!SECRET) throw new Error("JWT_SECRET is not set");

const EXPIRES_IN = "7d";

export interface TokenPayload {
  userId: number;
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, SECRET as string, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, SECRET as string);
  if (typeof decoded === "string" || typeof decoded.userId !== "number") {
    throw new Error("Invalid token payload");
  }
  return { userId: decoded.userId };
}
