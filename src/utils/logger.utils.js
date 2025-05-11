import winston from 'winston';
import Variable from '../config/variables.config.js';

// Common log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
);

const IS_PROD = Variable.IS_PROD === 'true';

// Logger instance as per environment
export const logger = winston.createLogger({
  level: IS_PROD ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Use console with colorization in non-production environment
    ...(IS_PROD
      ? [new winston.transports.File({ filename: 'logs/app.log' })]
      : [
          new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat),
          }),
        ]),
  ],
});
