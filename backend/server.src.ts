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
import { requireAuth } from "./src/middleware/authMiddleware.ts";
import { scrapeLeetCodeTitle } from "./src/controllers/trackerController.ts";

interface DocumentMetadata {
  id: string;
  filename: string;
  title: string;
  tags: string[];
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

import cors from "cors";
import rateLimit from "express-rate-limit";

// Enable Cross-Origin Resource Sharing (CORS) for external frontend hosting
app.use(cors({
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
          allowedDomain = rawFrontendUrl.split('/')[0]; // Strip trailing paths if any
        }
      }

      const isLocal = originHostname === "localhost" || 
                      originHostname === "127.0.0.1" || 
                      originHostname === "::1" ||
                      originHostname.startsWith("192.168.") || 
                      originHostname.startsWith("10.") ||
                      originHostname.endsWith(".local");

      if (originHostname === allowedDomain || isLocal || originHostname === "dsa.jimfleax.in") {
        return callback(null, true);
      }
      
      console.warn(`[CORS] Blocked request from origin: ${origin} (Hostname: ${originHostname}). Allowed Domain: ${allowedDomain}`);
      const corsError = new Error(`CORS Error: Origin ${origin} is not allowed.`);
      (corsError as any).status = 403;
      return callback(corsError);
    } catch (err) {
      return callback(new Error("Invalid origin"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

// Pre-flight handler for all routes
app.options("*", cors() as any);

app.use(express.json());

const CONTENT_DIR = path.join(process.cwd(), "content");
const THEORY_DIR = path.join(CONTENT_DIR, "theory");

// Ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR);
  if (!fs.existsSync(THEORY_DIR)) fs.mkdirSync(THEORY_DIR);
}

ensureDirs();

// Helper to parse frontmatter from markdown files
function parseFrontmatter(
  content: string,
  filename: string,
): DocumentMetadata {
  const meta: DocumentMetadata = {
    id: `theory-${filename.replace(/\.md$/, "")}`,
    filename,
    title: filename.replace(/\.md$/, "").replace(/-/g, " "),
    tags: [],
  };

  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (frontmatterMatch) {
    const lines = frontmatterMatch[1].split("\n");
    for (const line of lines) {
      const idx = line.indexOf(":");
      if (idx !== -1) {
        const key = line.slice(0, idx).trim().toLowerCase();
        const value = line.slice(idx + 1).trim();
        if (key === "title") {
          meta.title = value.replace(/^['"]|['"]$/g, ""); // strip optional quotes
        } else if (key === "tags") {
          meta.tags = value
            .split(",")
            .map((t) => t.trim().replace(/^['"]|['"]$/g, ""))
            .filter(Boolean);
        }
      }
    }
  }

  return meta;
}

// ──────────────────────────────────────────────────────────
//  PUBLIC ENDPOINTS (no auth required)
// ���─────────────────────────────────────────────────────────

// API endpoint to retrieve all listed documents
app.get("/api/documents", async (req, res) => {
  try {
    ensureDirs();
    const result: DocumentMetadata[] = [];

    // Read Theory Directory
    if (fs.existsSync(THEORY_DIR)) {
      const theoryFiles = (await fs.promises.readdir(THEORY_DIR))
        .filter((file) => file.endsWith(".md"));
      
      const filePromises = theoryFiles.map(async (file) => {
        const filePath = path.join(THEORY_DIR, file);
        const content = await fs.promises.readFile(filePath, "utf-8");
        return parseFrontmatter(content, file);
      });
      
      const parsedDocs = await Promise.all(filePromises);
      result.push(...parsedDocs);
    }

    res.json({ success: true, documents: result });
  } catch (error: any) {
    console.error("Error reading documents directory:", error);
    res.status(500).json({ success: false, error: "Failed to list documents", message: error.message });
  }
});

// API endpoint to fetch details / content of a single document
app.get("/api/document", async (req, res) => {
  const { filename } = req.query;
  if (!filename) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid filename parameter." });
  }

  try {
    const targetDir = path.resolve(THEORY_DIR);
    // Security check to prevent Directory Traversal attacks
    const safeFilename = String(filename).replace(/[^a-zA-Z0-9.\-_]/g, "");
    const filePath = path.resolve(targetDir, safeFilename);

    if (!filePath.startsWith(targetDir)) {
      return res.status(403).json({ success: false, error: "Access denied." });
    }

    let fileStat;
    try {
      fileStat = await fs.promises.stat(filePath);
    } catch {
      fileStat = null;
    }

    if (!fileStat || !fileStat.isFile()) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        message: `The document ${safeFilename} could not be located on the server.`,
      });
    }

    const rawContent = await fs.promises.readFile(filePath, "utf-8");

    // Strip the YAML frontmatter for rendering pure markdown
    const clientContent = rawContent
      .replace(/^---\r?\n[\s\S]*?\r?\n---/, "")
      .trim();

    res.json({
      success: true,
      metadata: parseFrontmatter(rawContent, safeFilename),
      content: clientContent,
    });
  } catch (error: any) {
    console.error("Error loading document:", error);
    res.status(500).json({ success: false, error: "Internal Server Error", message: error.message });
  }
});

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
  message: { success: false, error: "Too many scrape requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.post("/api/problems/scrape-title", scrapeLimiter, scrapeLeetCodeTitle);

// PUBLIC UTILITY: LeetCode profile calendar proxy (no auth required)
// Used by the Command Palette to render user heatmaps
app.get("/api/leetcode/calendar/:username", scrapeLimiter, async (req, res) => {
  try {
    const { username } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
    
    if (!username) {
      return res.status(400).json({ success: false, error: "Username is required" });
    }

    const graphqlQuery = {
      operationName: "userProfileCalendar",
      variables: {
        username,
        ...(year && { year })
      },
      query: `query userProfileCalendar($username: String!, $year: Int) {
        matchedUser(username: $username) {
          profile {
            ranking
          }
          userCalendar(year: $year) {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
        }
      }`
    };

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error("[LeetCode Scraper] GraphQL error (userProfileCalendar):", data.errors);
      return res.status(400).json({ success: false, error: "LeetCode API returned an error" });
    }

    const userCalendar = data.data?.matchedUser?.userCalendar || null;
    const ranking = data.data?.matchedUser?.profile?.ranking || null;

    if (userCalendar) {
      userCalendar.ranking = ranking;
    }

    res.json({ success: true, data: userCalendar });
  } catch (error: any) {
    console.error("[LeetCode Scraper] Error fetching calendar:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch calendar from LeetCode" });
  }
});

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
app.use("/api/sync", requireAuth, syncRoutes);

// Mount Tracks API routes (requires authentication)
app.use("/api/tracks", requireAuth, trackRoutes);

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
        message: (process.env.NODE_ENV === "production" && status === 500) 
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
