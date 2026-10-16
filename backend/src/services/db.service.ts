import mongoose from "mongoose";
import { getEnv } from "../config/env.js";
import { logger } from "../utils/logger.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(retries = 3, backoffMs = 500): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  if (connectionPromise) {
    return connectionPromise;
  }

  const { MONGODB_URI } = getEnv();
  if (!MONGODB_URI) {
    const error: any = new Error("MONGODB_URI environment variable is missing or empty");
    error.code = "DB_UNAVAILABLE";
    throw error;
  }

  const isServerless = !!process.env.VERCEL;
  const actualRetries = isServerless ? 2 : retries;
  const timeoutMs = isServerless ? 9000 : 5000;

  const connectWithRetry = async (): Promise<typeof mongoose> => {
    let attempt = 0;
    while (attempt < actualRetries) {
      try {
        const conn = await mongoose.connect(MONGODB_URI, {
          bufferCommands: false,
          serverSelectionTimeoutMS: timeoutMs,
        });
        logger.info("MongoDB connected successfully");
        return conn;
      } catch (err) {
        attempt++;
        logger.warn({ err, attempt, retries: actualRetries }, "MongoDB connection attempt failed");
        if (attempt >= actualRetries) {
          connectionPromise = null;
          const error: any = new Error("Unable to connect to MongoDB: " + (err as any)?.message);
          error.code = "DB_UNAVAILABLE";
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt));
      }
    }
    connectionPromise = null;
    const error: any = new Error("Unable to connect to MongoDB after multiple retries");
    error.code = "DB_UNAVAILABLE";
    throw error;
  };

  connectionPromise = connectWithRetry();
  return connectionPromise;
}

export async function pingDatabase(): Promise<{ ok: boolean; latencyMs?: number }> {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return { ok: false };
  }

  try {
    const start = Date.now();
    // Ping with a 1-second timeout
    await Promise.race([
      mongoose.connection.db.admin().ping(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Ping timeout")), 1000)),
    ]);
    const latencyMs = Date.now() - start;
    return { ok: true, latencyMs };
  } catch {
    return { ok: false };
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connectionPromise = null;
}
