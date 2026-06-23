import express, { type Express } from "express";
import cors from "cors";
import { auth } from "@repo/auth/server";
import { toNodeHandler } from "better-auth/node";
import corsOptions from "./config/cors.js";
import routes from "./routes/index.js";

const app: Express = express();

// ─── CORS (allow Next.js frontend) ──────────────────────────────
app.use(cors(corsOptions));

// ─── Better Auth Route Handler ──────────────────────────────────
// Must be mounted BEFORE express.json() to handle its own body parsing
app.all("/api/auth/*splat", toNodeHandler(auth));

// ─── Body Parser (for non-auth routes) ──────────────────────────
app.use(express.json());

// ─── Public Routes ──────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "Todo App API is running 🚀" });
});

// ─── API Routes ─────────────────────────────────────────────────
app.use(routes);

export default app;
