config();
import { config } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../../models/user.model.js';
import { logger } from '../../utils/logger.utils.js';

const IS_PROD = Boolean(process.env.IS_PROD) || false;

const AppDataSource = new DataSource({
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || 'your_db_user',
  password: process.env.DB_PASSWORD || 'your_db_password',
  database: process.env.DB_NAME || 'your_db_name',
  synchronize: !IS_PROD,
  logging: !IS_PROD,
  entities: [User],
});

export default async function connectDB() {
  try {
    await AppDataSource.initialize();
    logger.info('📦 Data Source has been initialized!');
  } catch (err) {
    logger.error('❌ Error during Data Source initialization:', err, '\nExiting the process');
    process.exit(1);
  }
}
