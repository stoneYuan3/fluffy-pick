import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { LoginBody, SignupBody } from "../lib/schemas.js";

const router = Router();

async function publicUser(u: { id: number; name: string; email: string; avatar: string | null }) {
  const card = await prisma.card.findFirst({ where: { creatorId: u.id }, select: { id: true } });
  return { id: u.id, name: u.name, email: u.email, avatar: u.avatar, hasCards: card !== null };
}

router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = SignupBody.parse(req.body);
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });
    const token = signToken(user.id);
    return res.json({ token, user: await publicUser(user) });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      (err as { code?: string }).code === "P2002"
    ) {
      const target = (err as { meta?: { target?: string[] } }).meta?.target?.[0] ?? "field";
      return res.status(409).json({ error: `An account with that ${target} already exists` });
    }
    return next(err);
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = LoginBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { name: username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user.id);
    return res.json({ token, user: await publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.status(401).json({ error: "User not found" });
  return res.json({ user: await publicUser(user) });
});

export default router;
