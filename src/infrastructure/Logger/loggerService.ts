import { RuntimeConfig } from '../../config';
import { format, transports } from 'winston';
import CustomLogTransport from './Transports/loggerTransport';

const isProd = () => RuntimeConfig.environment === 'production';

export const loggerLevel = isProd ? 'info' : 'debug';

export const loggerTransports = [
  new transports.Console({
    level: isProd ? 'info' : 'debug',
    format: format.combine(
      format.colorize({ all: true }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(({ timestamp, level, message, stack }) => {
        return stack
          ? `${timestamp} [${level}]: ${message} \n${stack}`
          : `${timestamp} [${level}]: ${message}`;
      }),
    ),
  }),

  ...(isProd
    ? [
        new CustomLogTransport({
          level: 'warn',
          logDir: './logs',
          maxSizeMB: 5,
          maxFiles: 10,
        }),
      ]
    : []),
];

export const loggerFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
);
