import os from 'os';
import process from 'process';
import path from 'path';
import { Tail } from 'tail';

// Helper function to calculate CPU usage per core
const calculateCPUUsagePerCore = (interval = 100) => {
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
};

// Main controller function
export const getSystemAnalytics = async (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuLoad = os.loadavg(); // 1, 5, and 15 minute averages
  const cpuUsagePerCore = await calculateCPUUsagePerCore();

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
};

export const streamLogs = (req, res) => {
  const logFilePath = path.join(process.cwd(), 'logs', 'app.log');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Send headers now

  const tail = new Tail(logFilePath, {
    fromBeginning: false,
    follow: true,
    useWatchFile: true, // for better cross-platform support
  });

  tail.on('line', (line) => {
    res.write(`data: ${line}\n\n`);
  });

  tail.on('error', (err) => {
    console.error('Tail error:', err);
    res.write(`event: error\ndata: ${JSON.stringify(err)}\n\n`);
  });

  // Clean up if client disconnects
  req.on('close', () => {
    tail.unwatch();
    res.end();
  });
};
