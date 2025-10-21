import { Sequelize } from 'sequelize-typescript';
import logger from '../Logger';
import { MODELS } from './databaseModel';
import { databaseConfig } from '../../config';

export const sequelize = new Sequelize({
  ...databaseConfig,
  models: MODELS,
});

export const authenticateDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(`Database connection failed: ${err.message}`);
    } else {
      logger.error(`Database connection failed: ${String(err)}`);
    }
    process.exit(1);
  }
};
