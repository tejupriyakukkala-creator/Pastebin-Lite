import express from "express";
import helmet from "helmet";
import cors from "cors";
import { getEnv } from "./config/env.js";
import { requestIdMiddleware } from "./middleware/requestId.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import healthRoutes from "./routes/health.routes.js";
import pasteRoutes from "./routes/paste.routes.js";

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
    cors({
      origin: (origin, callback) => {
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

  // API Routes
  app.use("/api", healthRoutes);
  app.use("/api", pasteRoutes);

  // 404 handler for unknown /api routes
  app.use("/api", notFoundMiddleware);

  // Global error handler
  app.use(errorMiddleware);

  return app;
}
