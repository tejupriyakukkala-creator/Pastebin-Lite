import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers["x-request-id"];
  const requestId =
    typeof incomingId === "string" && incomingId.trim().length > 0
      ? incomingId.trim()
      : crypto.randomUUID();

  (req as any).requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}
