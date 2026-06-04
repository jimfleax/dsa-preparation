import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface DocumentMetadata {
  id: string;
  type: 'theory' | 'problemsheets';
  filename: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable Cross-Origin Resource Sharing (CORS) for external frontend hosting (e.g. Vercel)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

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
function parseFrontmatter(content: string, filename: string, type: 'theory' | 'problemsheets'): DocumentMetadata {
  const meta: DocumentMetadata = {
    id: `${type}-${filename.replace(/\.md$/, "")}`,
    type,
    filename,
    title: filename.replace(/\.md$/, "").replace(/-/g, " "),
    category: type === "theory" ? "Theory Reference" : "Problem Sheet",
    difficulty: "Medium",
    tags: []
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
          meta.title = value.replace(/^['"]|['"]$/g, ''); // strip optional quotes
        } else if (key === "category") {
          meta.category = value.replace(/^['"]|['"]$/g, '');
        } else if (key === "difficulty") {
          meta.difficulty = value.replace(/^['"]|['"]$/g, '') as any;
        } else if (key === "tags") {
          meta.tags = value.split(",").map(t => t.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
        }
      }
    }
  }

  return meta;
}

// API endpoint to retrieve all listed documents
app.get("/api/documents", (req, res) => {
  try {
    ensureDirs();
    const result: DocumentMetadata[] = [];

    // Read Theory Directory
    if (fs.existsSync(THEORY_DIR)) {
      const theoryFiles = fs.readdirSync(THEORY_DIR).filter(file => file.endsWith(".md"));
      for (const file of theoryFiles) {
        const filePath = path.join(THEORY_DIR, file);
        const content = fs.readFileSync(filePath, "utf-8");
        result.push(parseFrontmatter(content, file, "theory"));
      }
    }

    // Read Problemsheets Directory
    if (fs.existsSync(PROBLEMSHEETS_DIR)) {
      const sheetFiles = fs.readdirSync(PROBLEMSHEETS_DIR).filter(file => file.endsWith(".md"));
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
    return res.status(400).json({ success: false, error: "Invalid type or filename parameters." });
  }

  try {
    const targetDir = type === "theory" ? THEORY_DIR : PROBLEMSHEETS_DIR;
    // Security check to prevent Directory Traversal attacks (strictly allow alpha-numeric, dashes, and .md)
    const safeFilename = String(filename).replace(/[^a-zA-Z0-9.\-_]/g, "");
    const filePath = path.join(targetDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: `Document ${safeFilename} does not exist.` });
    }

    const rawContent = fs.readFileSync(filePath, "utf-8");
    
    // Strip the YAML frontmatter for rendering pure markdown
    const clientContent = rawContent.replace(/^---\r?\n[\s\S]*?\r?\n---/, "").trim();

    res.json({
      success: true,
      metadata: parseFrontmatter(rawContent, safeFilename, type),
      content: clientContent
    });
  } catch (error: any) {
    console.error("Error loading document:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite server middleware setup for development, or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
