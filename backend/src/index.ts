import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRouter from "./routes/auth.js";
import charaRouter from "./routes/chara.js";
import foodRouter from "./routes/food.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
// app.use("/auth", rateLimit({ windowMs: 15 * 60_000, max: 20 }));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
app.use("/auth", authRouter);
app.use("/chara", charaRouter);
app.use("/food", foodRouter);
app.use(errorHandler);

const port = process.env["PORT"] || 4000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
