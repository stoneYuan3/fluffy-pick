import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const path = first?.path.join(".") || "body";
    return res.status(400).json({ error: `${path}: ${first?.message ?? "Invalid input"}` });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
};