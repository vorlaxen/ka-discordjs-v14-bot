import client from "@/app/client";
import logger from "@/infrastructure/Logger";
import { botConfig } from "@/config";
import { initializeDatabase, sequelize } from "@/infrastructure/Database";
import { initializeRedis } from "./infrastructure/Cache";

const bootstrap = async () => {
  try {
    logger.info("Starting application bootstrap...");

    const [dbInit, redisInit] = await Promise.all([
      initializeDatabase(),
      initializeRedis(),
    ]);

    logger.info("Services initialized successfully.");

    await client.login(botConfig.token).then(async () => {
      if (client.user) {
        logger.info(`Logged in as ${client.user.tag} (ID: ${client.user.id})`);
      }
    });

    const shutdown = async (signal: string) => {
      try {
        logger.info(`Received ${signal}. Shutting down gracefully...`);
        await Promise.all([
          sequelize.close(),
          redisInit?.quit?.(),
          client.destroy()
        ]);
        logger.info("All services closed. Exiting process.");
        process.exit(0);
      } catch (err) {
        logger.error("Error during shutdown", err);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    logger.error("Failed to start application:", error);
    process.exit(1);
  }
};

bootstrap();
