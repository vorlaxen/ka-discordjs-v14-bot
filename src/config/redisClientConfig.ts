import { mustParse } from "@/utils/string";

const env = process.env;

export interface IRedisClientConfig {
  host: string;
  port: number;
  user?: string;
  password: string;
  db: number;
  tls?: Record<string, unknown>;
  prefix?: string;
  connectTimeout?: number;
  maxRetriesPerRequest?: number;
  enableOfflineQueue?: boolean;
  retryStrategy?: (times: number) => number | null;
}

export const redisClientConfig: IRedisClientConfig = {
  host: mustParse(env.REDIS_HOST, 'REDIS_HOST', String),
  port: mustParse(env.REDIS_PORT, 'REDIS_PORT', Number),
  user: env.REDIS_USERNAME || undefined,
  password: mustParse(env.REDIS_PASSWORD, 'REDIS_PASSWORD', String),
  db: Number(env.REDIS_DB) || 0,
  tls: env.REDIS_TLS_ENABLED === 'true' ? { rejectUnauthorized: false } : undefined,
  prefix: env.REDIS_PREFIX || undefined,

  connectTimeout: mustParse(env.REDIS_CONNECT_TIMEOUT || '10000', 'REDIS_CONNECT_TIMEOUT', Number),
  maxRetriesPerRequest: mustParse(env.REDIS_MAX_RETRIES || '5', 'REDIS_MAX_RETRIES', Number),
  enableOfflineQueue: env.REDIS_OFFLINE_QUEUE !== 'false',
  retryStrategy: (times: number) => {
    const max = mustParse(env.REDIS_RETRY_MAX || '10', 'REDIS_RETRY_MAX', Number);
    if (times > max) return null;
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};
