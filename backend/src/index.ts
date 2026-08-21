import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);

const port = process.env["PORT"] || 4000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
