import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import charaRouter from "./routes/chara.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use("/chara", charaRouter);
app.use(errorHandler);

const port = process.env["PORT"] || 4000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
