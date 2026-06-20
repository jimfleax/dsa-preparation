import { Request, Response, NextFunction } from "express";

interface HttpRequestMetrics {
  totalRequests: number;
  statusCodes: Record<string, number>;
  latencies: number[];
}

// Global variable to keep metrics in memory
const metrics: HttpRequestMetrics = {
  totalRequests: 0,
  statusCodes: {
    "2xx": 0,
    "3xx": 0,
    "4xx": 0,
    "5xx": 0,
  },
  latencies: [],
};

const MAX_LATENCY_SAMPLES = 1000;

export const httpMetricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;

    metrics.totalRequests++;

    const status = res.statusCode;
    if (status >= 200 && status < 300) metrics.statusCodes["2xx"]++;
    else if (status >= 300 && status < 400) metrics.statusCodes["3xx"]++;
    else if (status >= 400 && status < 500) metrics.statusCodes["4xx"]++;
    else if (status >= 500) metrics.statusCodes["5xx"]++;

    // Keep rolling window of latencies
    metrics.latencies.push(durationMs);
    if (metrics.latencies.length > MAX_LATENCY_SAMPLES) {
      metrics.latencies.shift();
    }
  });

  next();
};

export const getHttpMetricsSnapshot = () => {
  const latencies = [...metrics.latencies].sort((a, b) => a - b);
  const getPercentile = (p: number) => {
    if (latencies.length === 0) return 0;
    const index = Math.ceil((p / 100) * latencies.length) - 1;
    return latencies[index];
  };

  const avg = latencies.length 
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length 
    : 0;

  return {
    totalRequests: metrics.totalRequests,
    statusCodes: { ...metrics.statusCodes },
    latency: {
      avg: avg,
      p50: getPercentile(50),
      p95: getPercentile(95),
      p99: getPercentile(99),
      min: latencies[0] || 0,
      max: latencies[latencies.length - 1] || 0,
      samples: latencies.length,
    }
  };
};
