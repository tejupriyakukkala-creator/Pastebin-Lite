import mongoose from "mongoose";
import { getEnv } from "../config/env.js";
import { logger } from "../utils/logger.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToDatabase(retries = 5, backoffMs = 500): Promise<typeof mongoose> {
  if (connectionPromise) {
    return connectionPromise;
  }

  const { MONGODB_URI } = getEnv();

  const connectWithRetry = async (): Promise<typeof mongoose> => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const conn = await mongoose.connect(MONGODB_URI, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 2000,
        });
        logger.info("MongoDB connected successfully");
        return conn;
      } catch (err) {
        attempt++;
        logger.warn({ err, attempt, retries }, "MongoDB connection attempt failed");
        if (attempt >= retries) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt));
      }
    }
    throw new Error("Unable to connect to MongoDB after multiple retries");
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
