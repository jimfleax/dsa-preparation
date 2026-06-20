import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";

import { connectDB } from "./src/lib/db.ts";
import trackerRoutes from "./src/routes/trackerRoutes.ts";
import userRoutes from "./src/routes/userRoutes.ts";
import syncRoutes from "./src/routes/syncRoutes.ts";
import trackRoutes from "./src/routes/trackRoutes.ts";
import authRoutes from "./src/routes/authRoutes.ts";
import documentRoutes from "./src/routes/documentRoutes.ts";
import adminRoutes from "./src/routes/admin/index.ts";
import { requireAuth } from "./src/middleware/authMiddleware.ts";
import {
  scrapeLeetCodeTitle,
  getLeetCodeCalendar,
} from "./src/controllers/trackerController.ts";
import { httpMetricsMiddleware } from "./src/middleware/httpMetrics.ts";
import { metricsCollector } from "./src/lib/metricsCollector.ts";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

import cors from "cors";
import rateLimit from "express-rate-limit";

// Enable Cross-Origin Resource Sharing (CORS) for external frontend hosting
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      try {
        const originHostname = new URL(origin).hostname;

        let allowedDomain = "localhost";
        if (process.env.FRONTEND_URL) {
          const rawFrontendUrl = process.env.FRONTEND_URL.trim();
          if (rawFrontendUrl.startsWith("http")) {
            allowedDomain = new URL(rawFrontendUrl).hostname;
          } else {
            allowedDomain = rawFrontendUrl.split("/")[0]; // Strip trailing paths if any
          }
        }

        const isLocal =
          originHostname === "localhost" ||
          originHostname === "127.0.0.1" ||
          originHostname === "::1" ||
          originHostname.startsWith("192.168.") ||
          originHostname.startsWith("10.") ||
          originHostname.endsWith(".local");

        if (
          originHostname === allowedDomain ||
          isLocal ||
          originHostname === "dsa.jimfleax.in"
        ) {
          return callback(null, true);
        }

        console.warn(
          `[CORS] Blocked request from origin: ${origin} (Hostname: ${originHostname}). Allowed Domain: ${allowedDomain}`,
        );
        const corsError = new Error(
          `CORS Error: Origin ${origin} is not allowed.`,
        );
        (corsError as any).status = 403;
        return callback(corsError);
      } catch (err) {
        return callback(new Error("Invalid origin"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

// Pre-flight handler for all routes
app.options("*", cors() as any);

app.use(express.json());

// Track all HTTP metrics
app.use(httpMetricsMiddleware);

// ──────────────────────────────────────────────────────────
//  PUBLIC ENDPOINTS (no auth required)
// ──────────────────────────────────────────────────────────

// Mount Document API routes (public)
app.use("/api", documentRoutes);
// Added lightweight /api/health endpoint for separate hosting connectivity checks
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbConnected: !!process.env.MONGODB_URI,
  });
});

// PUBLIC UTILITY: LeetCode title scraper (no auth required, used by frontend in real-time)
const scrapeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per `window`
  message: {
    success: false,
    error: "Too many scrape requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.post("/api/problems/scrape-title", scrapeLimiter, scrapeLeetCodeTitle);

// PUBLIC UTILITY: LeetCode profile calendar proxy (no auth required)
// Used by the Command Palette to render user heatmaps
app.get("/api/leetcode/calendar/:username", scrapeLimiter, getLeetCodeCalendar);

// Native Auth routes
app.use("/api/auth", authRoutes);

// ──────────────────────────────────────────────────────────
//  PROTECTED ENDPOINTS (JWT auth required)
// ──────────────────────────────────────────────────────────

// Mount Problem Tracking API routes (requires authentication)
app.use("/api/tracker", requireAuth, trackerRoutes);

// Mount User Settings API routes (requires authentication)
app.use("/api/user", requireAuth, userRoutes);

// Mount Sync API routes (requires authentication)
app.use("/api/sync", requireAuth, scrapeLimiter, syncRoutes);

// Mount Tracks API routes (requires authentication)
app.use("/api/tracks", requireAuth, trackRoutes);

// Mount Admin API routes
app.use("/api/admin", adminRoutes);

// ──────────────────────────────────────────────────────────
//  GLOBAL ERROR HANDLER
// ──────────────────────────────────────────────────────────
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("[SERVER ERROR] ✗ Unhandled Exception in Middleware/Route");
    console.error(`[SERVER ERROR]   Path: ${req.method} ${req.path}`);
    console.error(`[SERVER ERROR]   Message: ${err.message}`);

    if (err.stack) {
      console.error(err.stack);
    }

    // Ensure JSON response for API routes
    if (req.path.startsWith("/api/")) {
      const status = err.status || 500;
      res.status(status).json({
        success: false,
        error: status === 500 ? "Internal Server Error" : "Client Error",
        message:
          process.env.NODE_ENV === "production" && status === 500
            ? "An unexpected error occurred"
            : err.message,
      });
    } else {
      // For non-API routes, fall back to default express handler or custom HTML
      next(err);
    }
  },
);

async function startServer() {
  try {
    // Connect to MongoDB before accepting requests
    await connectDB();
    
    // Start background metrics collection
    metricsCollector.start();

    app.listen(PORT, "0.0.0.0", () => {
      // Startup diagnostic banner — summarizes which services are active
      const mongoStatus = process.env.MONGODB_URI
        ? "✓ Connected"
        : "✗ Not configured";
      const jwtStatus = process.env.JWT_SECRET
        ? "✓ Active"
        : "✗ Not configured";
      const env = process.env.NODE_ENV || "development";

      console.log("");
      console.log("╔══════════════════════════════════════════════════════╗");
      console.log("║           DSA Preparation — Server Started           ║");
      console.log("╠══════════════════════════════════════════════════════╣");
      console.log(
        `║  URL:        http://localhost:${String(PORT).padEnd(25)}║`,
      );
      console.log(`║  Env:        ${env.padEnd(39)}║`);
      console.log(`║  MongoDB:    ${mongoStatus.padEnd(39)}║`);
      console.log(`║  JWT Auth:   ${jwtStatus.padEnd(39)}║`);
      console.log("╚══════════════════════════════════════════════════════╝");
      console.log("");
    });
  } catch (error) {
    const err = error as Error;
    console.error("");
    console.error("╔══════════════════════════════════════════════════════╗");
    console.error("║        ✗ FATAL: Server failed to start               ║");
    console.error("╠══════════════════════════════════════════════════════╣");
    console.error(`║  Error: ${err.message.substring(0, 44).padEnd(44)}║`);
    console.error("╚══════════════════════════════════════════════════════╝");
    console.error("");
    console.error("Full stack trace:");
    console.error(err.stack || err);
    process.exit(1);
  }
}

startServer();
