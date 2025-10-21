import Redis from 'ioredis';
import { redisClientConfig } from '../../config';
import logger from '../Logger';

let redisClient: Redis | null = null;
let redisReadyPromise: Promise<void> | null = null;

export const initializeRedis = async (): Promise<Redis> => {
  if (redisClient) {
    if (redisReadyPromise) await redisReadyPromise;
    return redisClient;
  }

  redisClient = new Redis(redisClientConfig);

  redisClient.on('connect', () => logger.info('Redis connecting...'));
  redisClient.on('ready', () => logger.info('Redis connection established'));
  redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));
  redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));
  redisClient.on('close', () => logger.warn('Redis connection closed'));
  redisClient.on('end', () => logger.info('Redis client ended'));

  redisReadyPromise = new Promise<void>((resolve, reject) => {
    redisClient!.once('ready', () => resolve());
    redisClient!.once('error', (err) => reject(err));
  });

  await redisReadyPromise;

  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) throw new Error("Redis client not initialized. Call initializeRedis() first.");
  return redisClient;
};
