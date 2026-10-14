import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";
import { connectToDatabase, disconnectDatabase } from "./services/db.service.js";
import { Paste } from "./models/paste.model.js";
import { logger } from "./utils/logger.js";

async function startServer() {
  const env = getEnv();

  if (env.TEST_MODE === "1" && env.NODE_ENV === "production") {
    logger.warn("SECURITY WARNING: TEST_MODE=1 is active in production. x-test-now-ms headers will be honored for automated grading.");
  }

  try {
    logger.info("Connecting to MongoDB persistence layer...");
    await connectToDatabase();

    // Ensure database indexes are fully built and ready
    logger.info("Initializing database collections and indexes...");
    await Paste.init();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT, env: env.NODE_ENV }, `Pastebin Lite API server started on port ${env.PORT}`);
    });

    // Graceful shutdown handling
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        try {
          await disconnectDatabase();
          logger.info("Database connection closed. Process terminating cleanly.");
          process.exit(0);
        } catch (err) {
          logger.error({ err }, "Error during database disconnection");
          process.exit(1);
        }
      });

      // Force terminate after 10 seconds if hanging
      setTimeout(() => {
        logger.error("Forcefully terminating after shutdown timeout");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("SIGINT", () => handleShutdown("SIGINT"));
  } catch (err) {
    logger.fatal({ err }, "Fatal error during server startup");
    process.exit(1);
  }
}

startServer();
