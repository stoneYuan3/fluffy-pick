import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { FoodCreateBody, FoodDeleteBody, FoodStatusBody } from "../lib/schemas.js";

const router = Router();

const listSelect = {
  id: true,
  name: true,
  description: true,
  photos: true,
  status: true,
  lastActiveAt: true,
  activeNumber: true,
  createdDate: true,
} as const;

router.get("/normal", requireAuth, async (req: Request, res: Response) => {
  const foods = await prisma.food.findMany({
    where: { creatorId: req.userId!, status: "normal" },
    select: listSelect,
    orderBy: { createdDate: "desc" },
  });
  return res.json({ foods });
});

router.get("/active", requireAuth, async (req: Request, res: Response) => {
  const foods = await prisma.food.findMany({
    where: { creatorId: req.userId!, status: "active" },
    select: listSelect,
    orderBy: { lastActiveAt: "desc" },
  });
  return res.json({ foods });
});

router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, photos } = FoodCreateBody.parse(req.body);
    const created = await prisma.food.create({
      data: {
        name,
        description: description ?? null,
        photos,
        creatorId: req.userId!,
      },
      select: listSelect,
    });
    return res.json({ food: created });
  } catch (err) {
    return next(err);
  }
});

router.delete("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = FoodDeleteBody.parse(req.body);
    const result = await prisma.food.deleteMany({
      where: { id: { in: ids }, creatorId: req.userId! },
    });
    return res.json({ count: result.count });
  } catch (err) {
    return next(err);
  }
});

router.put("/status", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids, status } = FoodStatusBody.parse(req.body);
    const data: { status: "normal" | "active"; lastActiveAt?: Date } = { status };
    if (status === "active") data.lastActiveAt = new Date();
    const result = await prisma.food.updateMany({
      where: { id: { in: ids }, creatorId: req.userId! },
      data,
    });
    return res.json({ count: result.count });
  } catch (err) {
    return next(err);
  }
});

export default router;