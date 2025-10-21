import { Dialect } from "sequelize";
import { mustParse } from "../utils/string";
import logger from "../infrastructure/Logger";

export interface DatabaseConfigType {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
  logging: boolean | ((sql: string) => void);
  timezone: string;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  define: {
    timestamps: boolean;
    underscored: boolean;
    paranoid: boolean;
    freezeTableName: boolean;
  };
  dialectOptions?: any;
}

const env = process.env;

export const databaseConfig: DatabaseConfigType = {
  username: mustParse(env.DB_USERNAME, 'DB_USERNAME', String),
  password: mustParse(env.DB_PASSWORD, 'DB_PASSWORD', String),
  database: mustParse(env.DB_NAME, 'DB_NAME', String),
  host: mustParse(env.DB_HOST, 'DB_HOST', String),
  port: mustParse(env.DB_PORT, 'DB_PORT', Number),
  dialect: 'postgres',
  logging: env.DB_LOGGING === 'true' ? (sql: string) => logger.debug(sql) : false,
  timezone: mustParse(env.DB_TIMEZONE, 'DB_TIMEZONE', String),
  pool: {
    max: mustParse(env.DB_POOL_MAX, 'DB_POOL_MAX', Number),
    min: mustParse(env.DB_POOL_MIN, 'DB_POOL_MIN', Number),
    acquire: mustParse(env.DB_POOL_ACQUIRE, 'DB_POOL_ACQUIRE', Number),
    idle: mustParse(env.DB_POOL_IDLE, 'DB_POOL_IDLE', Number),
  },
  dialectOptions: {
    ssl: env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : undefined,
  },
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true,
    freezeTableName: true,
  }
};
