import os from "node:os";
import fs from "node:fs";
import { monitorEventLoopDelay } from "node:perf_hooks";
import mongoose from "mongoose";

class MetricsCollector {
  private elDelay = monitorEventLoopDelay({ resolution: 20 });
  private lastCpuUsage: NodeJS.CpuUsage;
  private lastCpuSnapshotTime: number;

  private lastDiskStats: {
    reads: number;
    writes: number;
    readBytes: number;
    writeBytes: number;
    timestamp: number;
  } | null = null;

  constructor() {
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuSnapshotTime = performance.now();
  }

  public start() {
    this.elDelay.enable();
    this.takeDiskSnapshot();
  }

  private getContainerCpuLimit(): number | null {
    try {
      const max = fs.readFileSync("/sys/fs/cgroup/cpu.max", "utf8").trim().split(" ")[0];
      if (max !== "max") {
        return parseInt(max, 10) / 100000;
      }
    } catch {
      // Ignore
    }
    return null;
  }

  private getContainerMemoryLimit(): number | null {
    try {
      const max = fs.readFileSync("/sys/fs/cgroup/memory.max", "utf8").trim();
      if (max !== "max") return parseInt(max, 10);
    } catch {
      try {
        const limit = fs.readFileSync("/sys/fs/cgroup/memory/memory.limit_in_bytes", "utf8").trim();
        return parseInt(limit, 10);
      } catch {
        // Ignore
      }
    }
    return null;
  }

  private takeDiskSnapshot() {
    try {
      const stats = fs.readFileSync("/proc/diskstats", "utf8");
      let reads = 0, writes = 0, readSectors = 0, writeSectors = 0;
      
      const lines = stats.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 14 && (parts[2].startsWith('sd') || parts[2].startsWith('nvme') || parts[2].startsWith('vd'))) {
          reads += parseInt(parts[3], 10);
          readSectors += parseInt(parts[5], 10);
          writes += parseInt(parts[7], 10);
          writeSectors += parseInt(parts[9], 10);
        }
      }

      this.lastDiskStats = {
        reads,
        writes,
        readBytes: readSectors * 512,
        writeBytes: writeSectors * 512,
        timestamp: performance.now()
      };
    } catch {
      this.lastDiskStats = null;
    }
  }

  public getDiskMetrics() {
    const prev = this.lastDiskStats;
    this.takeDiskSnapshot();
    const curr = this.lastDiskStats;

    if (!prev || !curr) return null;

    const deltaSec = (curr.timestamp - prev.timestamp) / 1000;
    if (deltaSec === 0) return null;

    return {
      readsCompleted: curr.reads,
      writesCompleted: curr.writes,
      readIOPS: (curr.reads - prev.reads) / deltaSec,
      writeIOPS: (curr.writes - prev.writes) / deltaSec,
      readBytesPerSecond: (curr.readBytes - prev.readBytes) / deltaSec,
      writeBytesPerSecond: (curr.writeBytes - prev.writeBytes) / deltaSec,
    };
  }

  public getCpuMetrics() {
    const currentCpu = process.cpuUsage(this.lastCpuUsage);
    const currentTime = performance.now();
    const elapsedTime = (currentTime - this.lastCpuSnapshotTime) * 1000; // microsec
    
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuSnapshotTime = currentTime;

    const userPercent = (currentCpu.user / elapsedTime) * 100;
    const systemPercent = (currentCpu.system / elapsedTime) * 100;

    const containerLimit = this.getContainerCpuLimit();
    const cores = containerLimit || os.cpus().length;

    return {
      cores,
      utilizationPercent: Math.min((userPercent + systemPercent) / cores, 100),
      containerLimited: !!containerLimit,
      containerCpuLimit: containerLimit,
    };
  }

  public getMemoryMetrics() {
    const mem = process.memoryUsage();
    const containerLimit = this.getContainerMemoryLimit();
    const totalBytes = containerLimit || os.totalmem();
    
    return {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
      arrayBuffers: mem.arrayBuffers || 0,
      heapUsagePercent: (mem.heapUsed / mem.heapTotal) * 100,
      totalBytes,
      freeBytes: os.freemem(),
      usedBytes: totalBytes - os.freemem(),
      utilizationPercent: ((totalBytes - os.freemem()) / totalBytes) * 100,
      containerLimited: !!containerLimit,
      containerMemoryLimitBytes: containerLimit,
    };
  }

  public getEventLoopMetrics() {
    return {
      min: this.elDelay.min / 1e6,
      max: this.elDelay.max / 1e6,
      mean: this.elDelay.mean / 1e6,
      p50: this.elDelay.percentile(50) / 1e6,
      p95: this.elDelay.percentile(95) / 1e6,
      p99: this.elDelay.percentile(99) / 1e6,
      unit: "ms",
    };
  }

  public async getMongoMetrics() {
    if (mongoose.connection.readyState !== 1) return null;
    
    const db = mongoose.connection.db;
    if (!db) return null;

    try {
      const status = await db.admin().command({ serverStatus: 1 });
      let replLag: number | null = null;
      let replLagReason: string | null = null;

      try {
        const replStatus = await db.admin().command({ replSetGetStatus: 1 });
        const primary = replStatus.members?.find((m: any) => m.stateStr === 'PRIMARY');
        const secondary = replStatus.members?.find((m: any) => m.stateStr === 'SECONDARY');
        if (primary && secondary) {
          replLag = (primary.optimeDate.getTime() - secondary.optimeDate.getTime()) / 1000;
        }
      } catch (err) {
        replLagReason = "Not available on Atlas shared tier (M0) or standalone";
      }

      return {
        connections: status.connections,
        opcounters: status.opcounters,
        replicationLag: replLag,
        replicationLagReason: replLagReason,
        cache: status.wiredTiger?.cache,
        pageFaults: status.extra_info?.page_faults,
      };
    } catch (err) {
      console.error("[MetricsCollector] Error fetching mongo metrics:", err);
      return null;
    }
  }

  public getOsMetrics() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      nodeVersion: process.version,
    };
  }
}

export const metricsCollector = new MetricsCollector();
