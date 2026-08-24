import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import {
  ChangePasswordBody,
  LocaleBody,
  LoginBody,
  SignupBody,
  UpdateProfileBody,
  type Locale,
} from "../lib/schemas.js";
import { resolveRequestLocale } from "../lib/locale.js";

const router = Router();

async function publicUser(u: {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  locale: string;
}) {
  const card = await prisma.card.findFirst({ where: { creatorId: u.id }, select: { id: true } });
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    locale: u.locale as Locale,
    hasCards: card !== null,
  };
}

function isPrismaUniqueError(err: unknown): err is { code: string; meta?: { target?: string[] } } {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
}

router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = SignupBody.parse(req.body);
    const hashed = await bcrypt.hash(password, 10);
    const locale = resolveRequestLocale(req);
    const user = await prisma.user.create({ data: { name, email, password: hashed, locale } });
    const token = signToken(user.id, user.locale as Locale);
    return res.json({ token, user: await publicUser(user) });
  } catch (err: unknown) {
    if (isPrismaUniqueError(err)) {
      const target = err.meta?.target?.[0] ?? "field";
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

    const token = signToken(user.id, user.locale as Locale);
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

router.patch("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = UpdateProfileBody.parse(req.body);
    const data: { name?: string; email?: string } = {};
    if (parsed.name !== undefined) data.name = parsed.name;
    if (parsed.email !== undefined) data.email = parsed.email;
    const user = await prisma.user.update({ where: { id: req.userId! }, data });
    return res.json({ user: await publicUser(user) });
  } catch (err) {
    if (isPrismaUniqueError(err)) {
      const target = err.meta?.target?.[0] ?? "field";
      return res.status(409).json({ error: `An account with that ${target} already exists` });
    }
    return next(err);
  }
});

router.patch("/me/locale", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { locale } = LocaleBody.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.userId! }, data: { locale } });
    const token = signToken(user.id, user.locale as Locale);
    return res.json({ token, user: await publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.patch("/me/password", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = ChangePasswordBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) return res.status(401).json({ error: "User not found" });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ error: "Current password is incorrect" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
