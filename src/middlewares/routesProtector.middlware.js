import { verifyToken } from '../utils/jwt.utils.js';
import AuthMessages from '../config/messages/auth.messages.js';
import httpStatus from 'http-status';

/**
 * Middleware to protect routes based on user designation
 * @param {string|string[]} allowedDesignations - Single designation or array of designations allowed to access the route
 */

const protect = (allowedDesignations) => {
  return async (req, res, next) => {
    try {
      // Check if token exists
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: AuthMessages.TOKEN_MISSING,
        });
      }

      // Extract token
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: AuthMessages.TOKEN_MISSING,
        });
      }

      // Verify token
      let decodedToken;
      try {
        decodedToken = verifyToken(token);
        if (!decodedToken || decodedToken.type !== 'Access')
          return res.status(httpStatus.FORBIDDEN).json({
            success: false,
            message: AuthMessages.UNAUTHORIZED_ACCESS,
          });

        // At this point user is validated (adding user to request object)
        ['iat', 'exp', 'type'].map((item) => delete decodedToken[item]);
        req.user = decodedToken;
      } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message:
            error.name === 'TokenExpiredError'
              ? AuthMessages.TOKEN_EXPIRED
              : AuthMessages.INVALID_TOKEN,
        });
      }

      // Check if user designation is allowed
      const userDesignation = decodedToken.designation;
      const designationsToCheck = Array.isArray(allowedDesignations)
        ? allowedDesignations
        : [allowedDesignations];

      if (!designationsToCheck.includes(userDesignation)) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: AuthMessages.UNAUTHORIZED_ACCESS,
        });
      }

      // Attach user info to request
      req.user = decodedToken;
      next();
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: AuthMessages.SOMETHING_WENT_WRONG,
      });
    }
  };
};

export default protect;
