import Variable from '../config/variables.config.js';
import { logger } from '../utils/logger.utils.js';

const IS_PROD = Variable.IS_PROD === 'true';

export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Always log the full error on server side
  IS_PROD ? logger.error(err.message) : logger.error(err.stack);

  res.status(statusCode).json({
    success: false,
    status_code: statusCode,
    message: IS_PROD
      ? 'Something went wrong. Please try again later.'
      : err.message || 'Internal Server Error',
    ...(IS_PROD ? {} : { stack: err.stack }),
  });
}
