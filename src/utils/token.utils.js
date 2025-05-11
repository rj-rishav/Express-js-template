import jwt from 'jsonwebtoken';

import AppError from './appError.utils.js';
import Variable from '../config/variables.config.js';

const ACCESS_TOKEN_SECRET = Variable.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = Variable.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new AppError();
}

export const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: Variable.ACCESS_TOKEN_EXPIRATION,
  });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: Variable.REFRESH_TOKEN_EXPIRATION,
  });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
