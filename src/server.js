config();
import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { logger } from './utils/logger.utils.js';
import connectDB from './config/db/db.connection.js';
import MainRouter from './routes/index.route.js';

logger.info('Booting the server');

// Connect to DB
// await connectDB();

const server = express();

// Important Middlewares
server.use(cors()).use(helmet());

// Route Middleware
server.use('/api', MainRouter);

const PORT = process.env.PORT || 4444;

server.listen(PORT, () => logger.info(`Server started at port: ${PORT}`));
