import { Request, Response } from "express";
import fs from "fs";
import path from "path";

interface DocumentMetadata {
  id: string;
  filename: string;
  title: string;
  tags: string[];
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const THEORY_DIR = path.join(CONTENT_DIR, "theory");

function ensureDirs() {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR);
  if (!fs.existsSync(THEORY_DIR)) fs.mkdirSync(THEORY_DIR);
}

function parseFrontmatter(content: string, filename: string): DocumentMetadata {
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

export const getDocuments = async (req: Request, res: Response) => {
  try {
    ensureDirs();
    const result: DocumentMetadata[] = [];

    if (fs.existsSync(THEORY_DIR)) {
      const theoryFiles = (await fs.promises.readdir(THEORY_DIR)).filter((file) =>
        file.endsWith(".md")
      );

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
    res.status(500).json({
      success: false,
      error: "Failed to list documents",
      message: error.message,
    });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  const { filename } = req.query;
  if (!filename) {
    return res.status(400).json({ success: false, error: "Invalid filename parameter." });
  }

  try {
    const targetDir = path.resolve(THEORY_DIR);
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
    const clientContent = rawContent.replace(/^---\r?\n[\s\S]*?\r?\n---/, "").trim();

    res.json({
      success: true,
      metadata: parseFrontmatter(rawContent, safeFilename),
      content: clientContent,
    });
  } catch (error: any) {
    console.error("Error loading document:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
