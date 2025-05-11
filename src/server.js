import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import AppError from './utils/appError.utils.js';
import errorHanndler from './middlewares/errorHandler.middleware.js';
import { logger } from './utils/logger.utils.js';
import connectDB from './config/db/connection.db.js';
import Messages from './config/messages.config.js';
import Variable from './config/variables.config.js';
import MainRouter from './routes/index.route.js';

logger.info(Messages.Global.success.SERVER_BOOTING);

// Connect to DB
await connectDB();

const server = express();

// Important Middlewares
server
  .use(cors())
  .use(helmet())
  .use(express.json())
  .use(express.urlencoded({ extended: true }));

// Route Middleware
server.get('/error', async (req, res) => {
  // const error = error.error;
  throw new AppError('This is custom error', 369);
});
server.use('/api', MainRouter);

// Error Handler middleware (Important to keep at the end)
server.use(errorHanndler);

const PORT = Variable.PORT;

server.listen(PORT, () => logger.info(`${Messages.Global.success.SERVER_BOOTED} ${PORT}`));
