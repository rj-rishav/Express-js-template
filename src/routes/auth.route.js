import { Router } from 'express';

import { validate } from '../middlewares/validator.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';
import AuthValidation from '../validations/auth.validation.js';

const AuthRouter = Router();

AuthRouter.post('/signup', validate(AuthValidation.signup), AuthController.signup)
  .post('/signin', validate(AuthValidation.signin), AuthController.signin)
  .post('/refresh-token', AuthController.refreshToken);

export default AuthRouter;
