import { Router } from 'express';

// Routes import
import SystemRoute from './system.route.js';
import AuthRouter from './auth.route.js';

const MainRouter = Router();

MainRouter.use('/system', SystemRoute).use('/auth', AuthRouter);

export default MainRouter;
