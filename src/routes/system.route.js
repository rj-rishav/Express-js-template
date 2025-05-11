import { Router } from 'express';
import SystemAnalyticsController from '../controllers/analytics.controller.js';

const SystemRoute = Router();

SystemRoute.get('/analytics', SystemAnalyticsController.getSystemAnalytics).get(
  '/logs',
  SystemAnalyticsController.streamLogs
);

export default SystemRoute;
