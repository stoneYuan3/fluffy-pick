import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = header.slice("Bearer ".length);
  try {
    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
