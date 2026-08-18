import express, { type Express } from "express";
import cors from "cors";
import { auth } from "@repo/auth/server";
import { toNodeHandler } from "better-auth/node";
import corsOptions from "./config/cors.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { activityLoggerMiddleware } from "./middleware/activity-logger.js";

const app: Express = express();

// ─── CORS (allow Next.js frontend) ──────────────────────────────
app.use(cors(corsOptions));

// ─── Better Auth Route Handler ──────────────────────────────────
// Must be mounted BEFORE express.json() to handle its own body parsing
app.all("/api/auth/*splat", toNodeHandler(auth));

// ─── Body Parser (for non-auth routes) ──────────────────────────
app.use(express.json({ limit: "10mb" }));

// ─── Activity Logger (logs all mutations) ───────────────────────
app.use(activityLoggerMiddleware);

// ─── Health Check ───────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ success: true, message: "University LMS API is running 🎓" });
});

// ─── API Routes ─────────────────────────────────────────────────
app.use(routes);

// ─── Global Error Handler (must be LAST) ────────────────────────
app.use(errorHandler);

export default app;
