import logger from '../Logger';
import { sequelize } from './databaseConnection';

interface InitializeDbOptions {
  force?: boolean;
  alter?: boolean;
}

export const initializeDatabase = async (options: InitializeDbOptions = {}): Promise<void> => {
  try {
    await sequelize.sync({
      force: options.force ?? false,
      alter: options.alter ?? true,
    });
    
    logger.info('Database synchronization completed.');
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Database synchronization failed: ${err.message}`);
    } else {
      logger.error(`Database synchronization failed: ${String(err)}`);
    }
    process.exit(1);
  }
};
