import 'dotenv/config';
import { RuntimeConfig, botConfig } from "./config";
import { initializeRedis } from "./infrastructure/Cache";
import { EventHandler } from "./handlers/eventHandler";
import logger from "./infrastructure/Logger";
import { initializeDatabase, sequelize } from "./infrastructure/Database";
import client from './infrastructure/Discord';
import { CommandHandler } from './handlers/commandHandler';
import path from 'path';

const bootstrap = async () => {
  try {
    logger.info("Starting application bootstrap...");

    const [dbInit, redisInit] = await Promise.all([
      initializeDatabase(),
      initializeRedis(),
    ]);

    logger.info("Services initialized successfully.");

    const eh = new EventHandler(client);
    await eh.loadAll();

    const ch = new CommandHandler(client, { commandsDir: "src/commands" });
    ch.loadAll();
    await ch.registerSlashCommands(botConfig.testServer);

    await client.login(botConfig.token).then();

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
