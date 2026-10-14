import { beforeAll, afterAll, beforeEach } from "vitest";
import fs from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectToDatabase, disconnectDatabase } from "../src/services/db.service.js";
import { Paste } from "../src/models/paste.model.js";

// Set baseline test environment variables before modules execute
process.env.NODE_ENV = "test";
process.env.TEST_MODE = "1";
process.env.BASE_URL = "https://your-frontend.example.com";
process.env.FRONTEND_URL = "https://your-frontend.example.com";
process.env.PORT = "5000";

let mongod: MongoMemoryServer | null = null;

beforeAll(async () => {
  let mongoUri = process.env.MONGODB_URI_TEST;

  if (!mongoUri) {
    try {
      const binaryOpts: Record<string, any> = {};
      const winMongod = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
      if (process.platform === "win32" && fs.existsSync(winMongod)) {
        binaryOpts.systemBinary = winMongod;
      }

      mongod = await MongoMemoryServer.create({
        binary: binaryOpts,
      });
      mongoUri = mongod.getUri();
    } catch (err) {
      console.warn("MongoMemoryServer failed to start, checking fallback:", err);
      if (!mongoUri) {
        throw new Error("Could not initialize MongoMemoryServer and no MONGODB_URI_TEST provided");
      }
    }
  }

  process.env.MONGODB_URI = mongoUri;

  await connectToDatabase();
  await Paste.init();
}, 30000);

beforeEach(async () => {
  if (Paste.db?.readyState === 1) {
    await Paste.deleteMany({});
  }
});

afterAll(async () => {
  await disconnectDatabase();
  if (mongod) {
    await mongod.stop();
  }
});
