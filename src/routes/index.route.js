import express from 'express';

// Routes import
import SystemRoute from './system.route.js';

const MainRouter = express.Router();

MainRouter.use('/system', SystemRoute);

export default MainRouter;
