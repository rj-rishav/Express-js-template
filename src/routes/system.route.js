import express from 'express';
import { getSystemAnalytics, streamLogs } from '../controllers/analytics.controller.js';

const SystemRoute = express.Router();

SystemRoute.get('/analytics', getSystemAnalytics).get('/logs', streamLogs);

export default SystemRoute;
