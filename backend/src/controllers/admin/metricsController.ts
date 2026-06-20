import { Request, Response } from "express";
import { metricsCollector } from "../../lib/metricsCollector";
import { getHttpMetricsSnapshot } from "../../middleware/httpMetrics";

export const getMetrics = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("[MetricsController] Error fetching metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};
