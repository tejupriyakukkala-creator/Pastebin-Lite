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

  // Root informational route (no database connection required)
  app.get("/", (_req, res) => {
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
