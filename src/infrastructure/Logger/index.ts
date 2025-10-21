import { createLogger, format, transports, Logger } from 'winston';
import { loggerFormat, loggerLevel, loggerTransports } from './loggerConfig';

const logger: Logger = createLogger({
  level: loggerLevel,
  format: loggerFormat,
  transports: loggerTransports,
  exitOnError: false,
  handleExceptions: true,
  handleRejections: true,
});

export { loggerFormat, loggerLevel, loggerTransports }
export default logger;