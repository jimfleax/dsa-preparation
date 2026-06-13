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
  type: "theory" | "problemsheets";
  filename: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
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

      if (originHostname === allowedDomain || originHostname === "localhost" || originHostname === "dsa.jimfleax.in") {
        return callback(null, true);
      }
      
      console.warn(`[CORS] Blocked request from origin: ${origin} (Hostname: ${originHostname}). Allowed Domain: ${allowedDomain}`);
      return callback(new Error("Not allowed by CORS"));
    } catch (err) {
      return callback(new Error("Invalid origin"));
    }
  },
  credentials: true
}));

app.use(express.json());

const CONTENT_DIR = path.join(process.cwd(), "content");
const THEORY_DIR = path.join(CONTENT_DIR, "theory");
const PROBLEMSHEETS_DIR = path.join(CONTENT_DIR, "problemsheets");

// Ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR);
  if (!fs.existsSync(THEORY_DIR)) fs.mkdirSync(THEORY_DIR);
  if (!fs.existsSync(PROBLEMSHEETS_DIR)) fs.mkdirSync(PROBLEMSHEETS_DIR);
}

ensureDirs();

// Helper to parse frontmatter from markdown files
function parseFrontmatter(
  content: string,
  filename: string,
  type: "theory" | "problemsheets",
): DocumentMetadata {
  const meta: DocumentMetadata = {
    id: `${type}-${filename.replace(/\.md$/, "")}`,
    type,
    filename,
    title: filename.replace(/\.md$/, "").replace(/-/g, " "),
    category: type === "theory" ? "Theory Reference" : "Problem Sheet",
    difficulty: "Medium",
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
        } else if (key === "category") {
          meta.category = value.replace(/^['"]|['"]$/g, "");
        } else if (key === "difficulty") {
          meta.difficulty = value.replace(/^['"]|['"]$/g, "") as any;
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
app.get("/api/documents", (req, res) => {
  try {
    ensureDirs();
    const result: DocumentMetadata[] = [];

    // Read Theory Directory
    if (fs.existsSync(THEORY_DIR)) {
      const theoryFiles = fs
        .readdirSync(THEORY_DIR)
        .filter((file) => file.endsWith(".md"));
      for (const file of theoryFiles) {
        const filePath = path.join(THEORY_DIR, file);
        const content = fs.readFileSync(filePath, "utf-8");
        result.push(parseFrontmatter(content, file, "theory"));
      }
    }

    // Read Problemsheets Directory
    if (fs.existsSync(PROBLEMSHEETS_DIR)) {
      const sheetFiles = fs
        .readdirSync(PROBLEMSHEETS_DIR)
        .filter((file) => file.endsWith(".md"));
      for (const file of sheetFiles) {
        const filePath = path.join(PROBLEMSHEETS_DIR, file);
        const content = fs.readFileSync(filePath, "utf-8");
        result.push(parseFrontmatter(content, file, "problemsheets"));
      }
    }

    res.json({ success: true, documents: result });
  } catch (error: any) {
    console.error("Error reading documents directory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to fetch details / content of a single document
app.get("/api/document", (req, res) => {
  const { type, filename } = req.query;
  if (!type || !filename || (type !== "theory" && type !== "problemsheets")) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid type or filename parameters." });
  }

  try {
    const targetDir = path.resolve(type === "theory" ? THEORY_DIR : PROBLEMSHEETS_DIR);
    // Security check to prevent Directory Traversal attacks
    const safeFilename = String(filename).replace(/[^a-zA-Z0-9.\-_]/g, "");
    const filePath = path.resolve(targetDir, safeFilename);

    if (!filePath.startsWith(targetDir)) {
      return res.status(403).json({ success: false, error: "Access denied." });
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return res.status(404).json({
        success: false,
        error: `Document ${safeFilename} does not exist.`,
      });
    }

    const rawContent = fs.readFileSync(filePath, "utf-8");

    // Strip the YAML frontmatter for rendering pure markdown
    const clientContent = rawContent
      .replace(/^---\r?\n[\s\S]*?\r?\n---/, "")
      .trim();

    res.json({
      success: true,
      metadata: parseFrontmatter(rawContent, safeFilename, type),
      content: clientContent,
    });
  } catch (error: any) {
    console.error("Error loading document:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Added lightweight /api/health endpoint for separate hosting connectivity checks
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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
      res.status(err.status || 500).json({
        success: false,
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message,
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
