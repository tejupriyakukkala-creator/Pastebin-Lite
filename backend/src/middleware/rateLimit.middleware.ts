import rateLimit from "express-rate-limit";
import { getEnv } from "../config/env.js";
import type { Request, Response, NextFunction } from "express";

let readLimiter: any = null;
let createLimiter: any = null;

function buildLimiter(maxPerMin: number) {
  return (rateLimit as any)({
    windowMs: 60 * 1000,
    max: maxPerMin,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests, please try again later",
        },
      });
    },
  });
}

export function initRateLimiters(): void {
  const { RATE_LIMIT_READ_PER_MIN, RATE_LIMIT_CREATE_PER_MIN } = getEnv();
  readLimiter = buildLimiter(RATE_LIMIT_READ_PER_MIN);
  createLimiter = buildLimiter(RATE_LIMIT_CREATE_PER_MIN);
}

export function readLimiterMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === "test") {
    return next();
  }
  if (!readLimiter) {
    initRateLimiters();
  }
  readLimiter(req, res, next);
}

export function createLimiterMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === "test") {
    return next();
  }
  if (!createLimiter) {
    initRateLimiters();
  }
  createLimiter(req, res, next);
}
