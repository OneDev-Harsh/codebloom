import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------- middleware ---------- */
app.use(express.json({ limit: "50mb" }));

app.use(
  cors({
    origin: process.env.TRUSTED_ORIGINS?.split(",") || [],
    credentials: true,
  })
);

/* ---------- frontend ---------- */
/**
 * After build, frontend lives here:
 * server/dist/client/index.html
 */
const CLIENT_DIST_PATH = path.join(__dirname, "client");

app.use(express.static(CLIENT_DIST_PATH));

/* ---------- auth & APIs ---------- */
app.all("/api/auth/:path(*)", toNodeHandler(auth));
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

/* ---------- SPA fallback (LAST) ---------- */
app.use((req, res) => {
  res.sendFile(path.join(CLIENT_DIST_PATH, "index.html"));
});

/* ---------- start ---------- */
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
