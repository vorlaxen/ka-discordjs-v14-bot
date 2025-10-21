import logger from "./infrastructure/Logger";

const bootstrap = async () => {
  try {
    logger.info("Starting application bootstrap...");

    //const [] = await Promise.all([]);

    logger.info("Services initialized successfully.");


    


    const shutdown = async (signal: string) => {
      try {
        logger.info(`Received ${signal}. Shutting down gracefully...`);
        //await Promise.all([]);
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
