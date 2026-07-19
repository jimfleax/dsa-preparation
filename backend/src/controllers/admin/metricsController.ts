import { Request, Response } from "express";
import { metricsCollector } from "../../lib/metricsCollector.js";
import { getHttpMetricsSnapshot } from "../../middleware/httpMetrics.js";
import { AppError } from "../../lib/AppError.ts";
import { catchAsync } from "../../lib/catchAsync.ts";

export const getMetrics = catchAsync(async (req: Request, res: Response) => {
  const memory = metricsCollector.getMemoryMetrics();
  const cpu = metricsCollector.getCpuMetrics();
  const eventLoop = metricsCollector.getEventLoopMetrics();
  const disk = metricsCollector.getDiskMetrics();
  const osInfo = metricsCollector.getOsMetrics();
  const mongo = await metricsCollector.getMongoMetrics();
  const http = getHttpMetricsSnapshot();

  res.json({
    timestamp: new Date().toISOString(),
    os: osInfo,
    memory,
    cpu,
    eventLoop,
    disk,
    mongo,
    http,
  });
});
