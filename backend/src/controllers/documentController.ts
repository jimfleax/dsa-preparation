import { Request, Response } from "express";
import LearningDoc from "../models/LearningDoc.js";

interface DocumentMetadata {
  id: string;
  filename: string;
  title: string;
  tags: string[];
}

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const docs = await LearningDoc.find({}, "filename title tags").lean();

    const result: DocumentMetadata[] = docs.map((doc: any) => ({
      id: doc._id.toString(),
      filename: doc.filename,
      title: doc.title,
      tags: doc.tags || [],
    }));

    res.json({ success: true, documents: result });
  } catch (error: any) {
    console.error("Error reading documents from db:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list documents",
      message: error.message,
    });
  }
};

export const getDocument = async (req: Request, res: Response) => {
  const { filename } = req.query;
  if (!filename || typeof filename !== "string") {
    return res
      .status(400)
      .json({ success: false, error: "Invalid filename parameter." });
  }

  try {
    const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "");

    const doc = await LearningDoc.findOne({ filename: safeFilename }).lean();

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        message: `The document ${safeFilename} could not be located in the database.`,
      });
    }

    const metadata: DocumentMetadata = {
      id: doc._id.toString(),
      filename: doc.filename,
      title: doc.title,
      tags: doc.tags || [],
    };

    // Remove YAML frontmatter if it exists in the stored content just like before
    const clientContent = doc.content
      .replace(/^---\r?\n[\s\S]*?\r?\n---/, "")
      .trim();

    res.json({
      success: true,
      metadata,
      content: clientContent,
    });
  } catch (error: any) {
    console.error("Error loading document from db:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
