import type { Request, Response, NextFunction } from "express";
import { getEnv } from "../config/env.js";
import { getNow } from "../utils/clock.js";

export function validateCreatePaste(req: Request, res: Response, next: NextFunction): void {
  const { CONTENT_MAX_CHARS } = getEnv();
  const body = req.body;

  if (!body || typeof body !== "object") {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "Request body must be a JSON object",
        details: [{ field: "body", message: "Request body must be a JSON object" }],
      },
    });
    return;
  }

  const { content, ttl_seconds, max_views } = body;
  const details: Array<{ field: string; message: string }> = [];

  // Content validation
  if (content === undefined || content === null) {
    details.push({ field: "content", message: "content is required" });
  } else if (typeof content !== "string") {
    details.push({ field: "content", message: "content must be a string" });
  } else if (content.trim().length === 0) {
    details.push({ field: "content", message: "content cannot be empty or whitespace only" });
  } else if (content.length > CONTENT_MAX_CHARS) {
    // 413 for oversized content
    res.status(413).json({
      success: false,
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: `Content length (${content.length}) exceeds the maximum permitted limit of ${CONTENT_MAX_CHARS} characters`,
      },
    });
    return;
  }

  // ttl_seconds validation
  let parsedTtl: number | null = null;
  if (ttl_seconds !== undefined && ttl_seconds !== null) {
    if (typeof ttl_seconds !== "number" || !Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
      details.push({
        field: "ttl_seconds",
        message: "ttl_seconds must be an integer greater than or equal to 1",
      });
    } else if (ttl_seconds > 315360000) {
      details.push({
        field: "ttl_seconds",
        message: "ttl_seconds cannot exceed 315360000 (10 years)",
      });
    } else {
      parsedTtl = ttl_seconds;
      try {
        const now = getNow(req);
        const expiresAt = new Date(now.getTime() + ttl_seconds * 1000);
        if (isNaN(expiresAt.getTime())) {
          details.push({ field: "ttl_seconds", message: "Computed expiration date is invalid" });
        }
      } catch {
        // Will be caught by clock / error middleware
      }
    }
  }

  // max_views validation
  let parsedMaxViews: number | null = null;
  if (max_views !== undefined && max_views !== null) {
    if (typeof max_views !== "number" || !Number.isInteger(max_views) || max_views < 1) {
      details.push({
        field: "max_views",
        message: "max_views must be an integer greater than or equal to 1",
      });
    } else if (max_views > 1000000) {
      details.push({
        field: "max_views",
        message: "max_views cannot exceed 1000000",
      });
    } else {
      parsedMaxViews = max_views;
    }
  }

  if (details.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "Invalid input fields provided",
        details,
      },
    });
    return;
  }

  // Attach normalized parsed values
  req.body = {
    content,
    ttl_seconds: parsedTtl,
    max_views: parsedMaxViews,
  };

  next();
}
