config();
import { config } from 'dotenv';
import winston from 'winston';

// Common log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
);

// Logger instance as per environment
export const logger = winston.createLogger({
  level: process.env.IS_PROD ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Use console with colorization in non-production environment
    ...(process.env.IS_PROD
      ? [new winston.transports.File({ filename: 'logs/app.log' })]
      : [
          new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat),
          }),
        ]),
  ],
});
