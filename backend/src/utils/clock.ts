import type { Request } from "express";

export class InvalidTestTimeError extends Error {
  public readonly code = "INVALID_TEST_TIME";
  constructor(message = "Invalid x-test-now-ms header: must be a positive integer milliseconds since epoch") {
    super(message);
    this.name = "InvalidTestTimeError";
  }
}

/**
 * Returns current time for domain logic.
 * If TEST_MODE=1 and x-test-now-ms header is present, parses it.
 * If header is invalid, throws InvalidTestTimeError.
 * If TEST_MODE is not 1 or header is absent, returns real current time.
 */
export function getNow(req?: Request): Date {
  if (process.env.TEST_MODE === "1" && req) {
    const rawHeader = req.headers["x-test-now-ms"];
    if (rawHeader !== undefined && rawHeader !== null && rawHeader !== "") {
      const headerStr = Array.isArray(rawHeader) ? rawHeader[0] : String(rawHeader);
      const trimmed = headerStr.trim();
      
      // Must be purely digits representing an integer timestamp >= 0
      if (!/^\d+$/.test(trimmed)) {
        throw new InvalidTestTimeError();
      }

      const parsedMs = Number(trimmed);
      if (!Number.isSafeInteger(parsedMs) || parsedMs < 0) {
        throw new InvalidTestTimeError();
      }

      const date = new Date(parsedMs);
      if (isNaN(date.getTime())) {
        throw new InvalidTestTimeError();
      }

      return date;
    }
  }

  return new Date();
}

/**
 * Returns actual system clock time, independent of test headers.
 * Used for physical retention (purgeAt) and log timestamps.
 */
export function getRealNow(): Date {
  return new Date();
}
