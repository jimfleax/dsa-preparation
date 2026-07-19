import { Request, Response } from "express";
import LearningDoc from "../models/LearningDoc.js";
import { AppError } from "../lib/AppError.ts";
import { catchAsync } from "../lib/catchAsync.ts";

interface DocumentMetadata {
  id: string;
  filename: string;
  title: string;
  tags: string[];
}

export const getDocuments = catchAsync(async (req: Request, res: Response) => {
  const docs = await LearningDoc.find({}, "filename title tags").lean();

    const result: DocumentMetadata[] = docs.map((doc: any) => ({
      id: doc._id.toString(),
      filename: doc.filename,
      title: doc.title,
      tags: doc.tags || [],
    }));

  res.json({ success: true, documents: result });
});

export const getDocument = catchAsync(async (req: Request, res: Response) => {
  const { filename } = req.query;
  if (!filename || typeof filename !== "string") {
    throw AppError.badRequest("Invalid filename parameter.");
  }

  const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "");
  const doc = await LearningDoc.findOne({ filename: safeFilename }).lean();

  if (!doc) {
    throw AppError.notFound("Document not found: The document " + safeFilename + " could not be located in the database.");
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
});
