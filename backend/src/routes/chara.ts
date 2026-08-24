import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { currentCutoff } from "../lib/cutoff.js";
import { requireAuth } from "../middleware/auth.js";
import { CharaCreateBody, CommitBody } from "../lib/schemas.js";

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

router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { charas } = CharaCreateBody.parse(req.body);
    const created = await prisma.$transaction(
      charas.map((c) =>
        prisma.card.create({
          data: { name: c.name, avatar: c.avatar, creatorId: req.userId! },
          select: { id: true, name: true, avatar: true },
        }),
      ),
    );
    return res.json({ charas: created });
  } catch (err) {
    return next(err);
  }
});

router.post("/commit", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = CommitBody.parse(req.body);
    const result = await prisma.card.updateMany({
      where: { id: { in: ids }, creatorId: req.userId!, status: "normal" },
      data: { activatedAt: new Date(), assigned: { increment: 1 } },
    });
    return res.json({ count: result.count });
  } catch (err) {
    return next(err);
  }
});

router.post("/archive", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = CommitBody.parse(req.body);
    const result = await prisma.card.updateMany({
      where: { id: { in: ids }, creatorId: req.userId! },
      data: { status: "archived" },
    });
    return res.json({ count: result.count });
  } catch (err) {
    return next(err);
  }
});

router.post("/delete", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = CommitBody.parse(req.body);
    const result = await prisma.card.deleteMany({
      where: { id: { in: ids }, creatorId: req.userId! },
    });
    return res.json({ count: result.count });
  } catch (err) {
    return next(err);
  }
});

export default router;
