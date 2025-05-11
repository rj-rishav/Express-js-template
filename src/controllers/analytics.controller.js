import os from 'os';
import path from 'path';
import { Tail } from 'tail';
import { logger } from '../utils/logger.utils.js';

class SystemAnalyticsController {
  // Static helper to calculate CPU usage per core
  static calculateCPUUsagePerCore(interval = 100) {
    return new Promise((resolve) => {
      const startMeasures = os.cpus();

      setTimeout(() => {
        const endMeasures = os.cpus();

        const usage = endMeasures.map((end, i) => {
          const start = startMeasures[i];
          const idleDiff = end.times.idle - start.times.idle;
          const totalDiff = Object.keys(start.times).reduce((acc, type) => {
            return acc + (end.times[type] - start.times[type]);
          }, 0);

          const usagePercent = 100 - Math.round((idleDiff / totalDiff) * 100);

          return {
            core: i,
            speedMHz: end.speed,
            usagePercent,
          };
        });

        resolve(usage);
      }, interval);
    });
  }

  // Static route handler for system analytics
  static async getSystemAnalytics(req, res, next) {
    const memoryUsage = process.memoryUsage();
    const cpuLoad = os.loadavg();
    const cpuUsagePerCore = await SystemAnalyticsController.calculateCPUUsagePerCore();

    const data = {
      memory: {
        rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
        heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
        externalMB: (memoryUsage.external / 1024 / 1024).toFixed(2),
      },
      cpu: {
        loadAvg: {
          '1min': cpuLoad[0].toFixed(2),
          '5min': cpuLoad[1].toFixed(2),
          '15min': cpuLoad[2].toFixed(2),
        },
        cpuModel: os.cpus()[0].model,
        coreCount: os.cpus().length,
        architecture: os.arch(),
        platform: os.platform(),
        perCore: cpuUsagePerCore,
      },
      uptime: {
        systemUptimeSec: os.uptime(),
        processUptimeSec: process.uptime(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        hostname: os.hostname(),
      },
    };

    res.status(200).json(data);
  }

  // Static route handler for log streaming
  static streamLogs(req, res, next) {
    const logFilePath = path.join(process.cwd(), 'logs', 'app.log');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const tail = new Tail(logFilePath, {
      fromBeginning: false,
      follow: true,
      useWatchFile: true,
    });

    tail.on('line', (line) => {
      res.write(`data: ${line}\n\n`);
    });

    tail.on('error', (err) => {
      logger.error(`Tail error: ${err.message}`);
      next(err); // Delegate to centralized error handler
    });

    req.on('close', () => {
      tail.unwatch();
      res.end();
    });
  }
}

export default SystemAnalyticsController;
