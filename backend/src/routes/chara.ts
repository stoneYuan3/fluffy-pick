import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

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

export default router;
