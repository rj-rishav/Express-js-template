config();
import { config } from 'dotenv';

const Variable = {
  PORT: parseInt(process.env.PORT) || 4444,
  IS_PROD: process.env.IS_PROD || false,
  DB_TYPE: process.env.DB_TYPE || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_USERNAME: process.env.DB_USERNAME || 'your_db_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'your_db_password',
  DB_NAME: process.env.DB_NAME || 'your_db_name',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'your_secret',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your_secret',
  ACCESS_TOKEN_EXPIRATION: '1h',
  REFRESH_TOKEN_EXPIRATION: '7d',
};

export default Variable;
