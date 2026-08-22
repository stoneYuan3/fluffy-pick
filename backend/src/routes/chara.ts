import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { currentCutoff } from "../lib/cutoff.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const rows = await prisma.card.findMany({
    where: { creatorId: req.userId!, status: "normal" },
    select: { id: true, name: true, avatar: true, activatedAt: true },
    orderBy: { createdDate: "desc" },
  });
  const cutoff = currentCutoff();
  const charas = rows.map(({ activatedAt, ...rest }) => ({
    ...rest,
    state: activatedAt && activatedAt >= cutoff ? "active" : "standby",
  }));
  return res.json({ charas });
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { charas } = req.body ?? {};
  if (!Array.isArray(charas) || charas.length === 0) {
    return res.status(400).json({ error: "charas must be a non-empty array" });
  }
  for (const c of charas) {
    if (typeof c?.name !== "string" || c.name.trim().length < 1) {
      return res.status(400).json({ error: "Each chara requires a name" });
    }
    if (c.avatar != null && typeof c.avatar !== "string") {
      return res.status(400).json({ error: "avatar must be a string or null" });
    }
  }

  try {
    const created = await prisma.$transaction(
      charas.map((c: { name: string; avatar: string | null }) =>
        prisma.card.create({
          data: {
            name: c.name.trim(),
            avatar: c.avatar ?? null,
            creatorId: req.userId!,
          },
          select: { id: true, name: true, avatar: true },
        }),
      ),
    );
    return res.json({ charas: created });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create charas" });
  }
});

router.post("/commit", requireAuth, async (req: Request, res: Response) => {
  const { ids } = req.body ?? {};
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((i) => Number.isInteger(i))) {
    return res.status(400).json({ error: "ids must be a non-empty array of integers" });
  }
  try {
    const result = await prisma.card.updateMany({
      where: { id: { in: ids }, creatorId: req.userId!, status: "normal" },
      data: { activatedAt: new Date(), assigned: { increment: 1 } },
    });
    return res.json({ count: result.count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to commit selection" });
  }
});

export default router;
