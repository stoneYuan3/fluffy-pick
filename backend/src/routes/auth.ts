import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(u: { id: number; name: string; email: string; avatar: string | null }) {
  return { id: u.id, name: u.name, email: u.email, avatar: u.avatar };
}

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length < 1) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), password: hashed },
    });
    const token = signToken(user.id);
    return res.json({ token, user: publicUser(user) });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      (err as { code?: string }).code === "P2002"
    ) {
      const target = (err as { meta?: { target?: string[] } }).meta?.target?.[0] ?? "field";
      return res.status(409).json({ error: `An account with that ${target} already exists` });
    }
    console.error(err);
    return res.status(500).json({ error: "Failed to create account" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user.id);
  return res.json({ token, user: publicUser(user) });
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.status(401).json({ error: "User not found" });
  return res.json({ user: publicUser(user) });
});

export default router;
