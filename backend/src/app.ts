import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import { getEnv } from "./config/env.js";
import { requestIdMiddleware } from "./middleware/requestId.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import pasteRoutes from "./routes/paste.routes.js";
import { connectToDatabase } from "./services/db.service.js";
import { Paste } from "./models/paste.model.js";

import { initRateLimiters } from "./middleware/rateLimit.middleware.js";

export function createApp(): express.Application {
  const app = express();
  const { BODY_LIMIT, FRONTEND_URL, NODE_ENV } = getEnv();

  // Initialize rate limiters on app creation
  initRateLimiters();

  // Trust proxy for secure headers and client IP behind reverse proxy / ingress
  app.set("trust proxy", 1);

  // Security headers via Helmet
  app.use(
    (helmet as any)({
      contentSecurityPolicy: false, // API server
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    (cors as any)({
      origin: (origin: any, callback: any) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) {
          return callback(null, true);
        }
        if (NODE_ENV === "test" || origin === FRONTEND_URL) {
          return callback(null, true);
        }
        // In development, also allow matching host
        return callback(null, true);
      },
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-test-now-ms",
        "x-request-id",
        "x-delete-token",
      ],
      exposedHeaders: ["x-request-id"],
    })
  );

  // Request ID middleware
  app.use(requestIdMiddleware);

  // Set default JSON Content-Type and Cache-Control for all /api endpoints
  app.use("/api", (_req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  // Body parser with configured limit
  app.use(express.json({ limit: BODY_LIMIT }));

  // Lazy DB connection for serverless invocations (e.g. Vercel)
  let dbPromise: Promise<void> | null = null;
  const ensureDb = async () => {
    if (mongoose.connection.readyState === 1 || NODE_ENV === "test") {
      return;
    }
    if (!dbPromise) {
      dbPromise = (async () => {
        await connectToDatabase();
        await Paste.init();
      })();
    }
    return dbPromise;
  };

  // Root informational route
  app.get("/", (req, res) => {
    if (req.accepts("html")) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pastebin Lite API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0e17; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #111827; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; max-width: 520px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; }
    h1 { margin-top: 0; font-size: 22px; color: #38bdf8; }
    p { color: #94a3b8; line-height: 1.6; font-size: 14px; }
    .badge { display: inline-block; background: #064e3b; color: #34d399; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    .code { background: #0f172a; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #cbd5e1; text-align: left; margin: 16px 0; }
    a.btn { display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 500; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">● Backend API Operational</span>
    <h1>Pastebin Lite Backend Service</h1>
    <p>This deployment is the <strong>Backend API</strong> for Pastebin Lite. It provides the REST endpoints for paste creation, atomic view consumption, and expiration.</p>
    <div class="code">
      GET /api/healthz<br>
      POST /api/pastes<br>
      GET /api/pastes/:id<br>
      DELETE /api/pastes/:id
    </div>
    <a class="btn" href="/api/healthz">Test /api/healthz Status &rarr;</a>
  </div>
</body>
</html>`);
    }

    res.json({
      name: "Pastebin Lite API",
      status: "ok",
      version: "1.0.0",
      endpoints: {
        health: "/api/healthz",
        pastes: "/api/pastes"
      }
    });
  });

  // Health check routes (check database readiness independently)
  app.use("/api", healthRoutes);

  // Lazy DB connection specifically for paste operations
  app.use("/api/pastes", async (_req, _res, next) => {
    try {
      await ensureDb();
      next();
    } catch (err) {
      next(err);
    }
  });

  // Paste API Routes
  app.use("/api", pasteRoutes);

  // 404 handler for unknown /api routes
  app.use("/api", notFoundMiddleware);

  // Global error handler
  app.use(errorMiddleware);

  return app;
}

// Lazy serverless handler for environments like Vercel
let lazyApp: express.Application | null = null;
const serverlessHandler = (req: any, res: any) => {
  try {
    if (!lazyApp) {
      lazyApp = createApp();
    }
    return lazyApp(req, res);
  } catch (err: any) {
    console.error("Fatal error in serverlessHandler:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: err?.message || "Internal server error occurred",
        },
      })
    );
  }
};

export default serverlessHandler;
