import { verifyToken } from '../utils/jwt.utils.js';
import AuthMessages from '../config/messages/auth.messages.js';
import HttpStatus from 'http-status';
import AppError from '../utils/appError.utils.js';

/**
 * Middleware to protect routes based on user designation
 * @param {string|string[]=} allowedDesignations - Allowed designation(s) or none for open auth
 */
const protect = (allowedDesignations) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new AppError(AuthMessages.TOKEN_MISSING, HttpStatus.UNAUTHORIZED);
    }

    let decodedToken;
    try {
      decodedToken = verifyToken(token);
      if (!decodedToken || decodedToken?.type !== 'Access') {
        throw new AppError(AuthMessages.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
      }

      ['iat', 'exp', 'type'].forEach((key) => delete decodedToken[key]);
    } catch (error) {
      const msg =
        error.name === 'TokenExpiredError'
          ? AuthMessages.TOKEN_EXPIRED
          : AuthMessages.INVALID_TOKEN;
      throw new AppError(msg, HttpStatus.UNAUTHORIZED);
    }

    if (allowedDesignations) {
      const userDesignation = decodedToken.designation?.toLowerCase();
      const allowed = (
        Array.isArray(allowedDesignations) ? allowedDesignations : [allowedDesignations]
      ).map((d) => d.toLowerCase());

      if (!allowed.includes(userDesignation)) {
        throw new AppError(AuthMessages.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
      }
    }

    req.user = decodedToken;
    next();
  };
};

export default protect;
