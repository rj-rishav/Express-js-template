import 'reflect-metadata';
import { DataSource } from 'typeorm';
import UserSchema from '../../models/user.model.js';
import { logger } from '../../utils/logger.utils.js';
import Messages from '../messages.config.js';
import Variable from '../variables.config.js';

const IS_PROD = Variable.IS_PROD === 'true';

export const AppDataSource = new DataSource({
  type: Variable.DB_TYPE,
  host: Variable.DB_HOST,
  port: Variable.DB_PORT,
  username: Variable.DB_USERNAME,
  password: Variable.DB_PASSWORD,
  database: Variable.DB_NAME,
  synchronize: !IS_PROD,
  logging: !IS_PROD,
  entities: [UserSchema],
});

export default async function connectDB() {
  try {
    await AppDataSource.initialize();
    logger.info(Messages.Global.success.DB_CONNECTED);
  } catch (err) {
    logger.error(Messages.Global.error.DB_CONNECTION_FAILED, err);
    process.exit(1);
  }
}
