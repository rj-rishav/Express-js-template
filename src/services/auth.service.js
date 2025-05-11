import bcrypt from 'bcrypt';

import Repository from '../config/db/repository.db.js';
import { generateTokens, verifyRefreshToken } from '../utils/token.utils.js';
import AppError from '../utils/appError.utils.js';
import Messages from '../config/messages.config.js';

export class AuthService {
  static async signup({ name, email, password }) {
    const existingUser = await Repository.User.findOne({ where: { email } });
    if (existingUser) throw new AppError(Messages.Auth.error.EMAIL_EXISTS, 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = Repository.User.create({ name, email, password: hashedPassword });

    await Repository.User.save(newUser);
    const tokens = generateTokens(newUser);

    return { user: { id: newUser.id, email: newUser.email, name: newUser.name }, tokens };
  }

  static async signin({ email, password }) {
    const user = await Repository.User.findOne({ where: { email } });
    if (!user) throw new AppError(Messages.Auth.error.INVAILD_CREDS, 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(Messages.Auth.error.INVAILD_CREDS, 401);

    const tokens = generateTokens(user);
    return { user: { id: user.id, email: user.email, name: user.name }, tokens };
  }

  static async refresh(refreshToken) {
    if (!refreshToken) throw new AppError(Messages.Auth.error.MISSING_REFRESH_TOKEN, 400);

    const payload = verifyRefreshToken(refreshToken);
    const user = await Repository.User.findOne({ where: { id: payload.id } });
    if (!user) throw new AppError(Messages.User.error.USER_NOT_FOUND, 404);

    const tokens = generateTokens(user);
    return tokens;
  }
}
