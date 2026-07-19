import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import trackerRoutes from "./src/routes/trackerRoutes.ts";
import userRoutes from "./src/routes/userRoutes.ts";
import syncRoutes from "./src/routes/syncRoutes.ts";
import trackRoutes from "./src/routes/trackRoutes.ts";
import authRoutes from "./src/routes/authRoutes.ts";
import documentRoutes from "./src/routes/documentRoutes.ts";
import adminRoutes from "./src/routes/admin/index.ts";
import { requireAuth } from "./src/middleware/authMiddleware.ts";
import { globalErrorHandler } from "./src/middleware/errorHandler.ts";
import { validateRequest } from "./src/middleware/validateRequest.ts";
import { scrapeTitleSchema, getLeetCodeCalendarSchema } from "./src/lib/validations/tracker.ts";
import {
  scrapeLeetCodeTitle,
  getLeetCodeCalendar,
} from "./src/controllers/trackerController.ts";
import { httpMetricsMiddleware } from "./src/middleware/httpMetrics.ts";

const app = express();

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
const isTestEnv = process.env.NODE_ENV === "test";

const scrapeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isTestEnv ? 10000 : 10, // Disable rate limiting in test mode
  message: {
    success: false,
    error: "Too many scrape requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: isTestEnv ? 10000 : 15, // Disable rate limiting in test mode
  message: {
    success: false,
    error: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/problems/scrape-title", scrapeLimiter, validateRequest(scrapeTitleSchema), scrapeLeetCodeTitle);

// PUBLIC UTILITY: LeetCode profile calendar proxy (no auth required)
// Used by the Command Palette to render user heatmaps
app.get("/api/leetcode/calendar/:username", scrapeLimiter, validateRequest(getLeetCodeCalendarSchema), getLeetCodeCalendar);

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
app.use(globalErrorHandler);

export default app;
