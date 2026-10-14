import type { Request, Response, NextFunction } from "express";
import { InvalidTestTimeError } from "../utils/clock.js";
import {
  PasteNotFoundError,
  PasteExpiredError,
  PasteViewLimitError,
  ForbiddenTokenError,
} from "../services/paste.service.js";
import { logger } from "../utils/logger.js";

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Always guarantee no-store and json content type
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");

  // Invalid test time header
  if (err instanceof InvalidTestTimeError || err.code === "INVALID_TEST_TIME") {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_TEST_TIME",
        message: err.message || "Invalid x-test-now-ms header",
      },
    });
    return;
  }

  // Malformed JSON from express.json()
  if (err instanceof SyntaxError && "body" in err && (err as any).status === 400) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Malformed JSON payload provided in request body",
      },
    });
    return;
  }

  // Payload too large from express.json() or custom limit
  if (err.type === "entity.too.large" || err.status === 413 || err.code === "PAYLOAD_TOO_LARGE") {
    res.status(413).json({
      success: false,
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Payload size exceeds maximum permitted limit",
      },
    });
    return;
  }

  // Paste domain errors
  if (err instanceof PasteNotFoundError || err.code === "PASTE_NOT_FOUND") {
    res.status(404).json({
      success: false,
      error: {
        code: "PASTE_NOT_FOUND",
        message: "Paste not found",
      },
    });
    return;
  }

  if (err instanceof PasteExpiredError || err.code === "PASTE_EXPIRED") {
    res.status(404).json({
      success: false,
      error: {
        code: "PASTE_EXPIRED",
        message: "Paste has expired",
      },
    });
    return;
  }

  if (err instanceof PasteViewLimitError || err.code === "PASTE_VIEW_LIMIT_REACHED") {
    res.status(404).json({
      success: false,
      error: {
        code: "PASTE_VIEW_LIMIT_REACHED",
        message: "Paste view limit has been reached",
      },
    });
    return;
  }

  if (err instanceof ForbiddenTokenError || err.code === "FORBIDDEN") {
    res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: err.message || "Unauthorized delete token",
      },
    });
    return;
  }

  // MongoDB / Database unavailable errors
  if (
    err.name === "MongoServerSelectionError" ||
    err.name === "MongoNetworkError" ||
    err.name === "MongooseServerSelectionError" ||
    err.name === "MongoTimeoutError" ||
    err.code === "DB_UNAVAILABLE"
  ) {
    logger.error({ err }, "Database connectivity error encountered");
    res.status(503).json({
      success: false,
      error: {
        code: "DB_UNAVAILABLE",
        message: "Database is temporarily unavailable. Please retry later.",
      },
    });
    return;
  }

  // Catch-all internal error
  logger.error({ err }, "Unhandled server exception");
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An internal server error occurred",
    },
  });
}
