import { Request, Response } from "express";
import LearningDoc from "../../models/LearningDoc.js";
import { AppError } from "../../lib/AppError.ts";
import { catchAsync } from "../../lib/catchAsync.ts";

export const getDocs = catchAsync(async (req: Request, res: Response) => {
  const docs = await LearningDoc.find().sort({ createdAt: -1 });
  res.json(docs);
});

export const createDoc = catchAsync(async (req: Request, res: Response) => {
  const { title, content, tags, filename } = req.body;

  // Type validation
  if (typeof title !== "string" || !title.trim()) {
    throw AppError.badRequest("Valid title is required");
  }
  if (typeof content !== "string" || !content.trim()) {
    throw AppError.badRequest("Valid content is required");
  }
  if (
    typeof filename !== "string" ||
    !filename.trim() ||
    !filename.endsWith(".md")
  ) {
    throw AppError.badRequest("Valid markdown filename (.md) is required");
  }

    let processedTags: string[] = [];
    if (Array.isArray(tags)) {
      processedTags = tags.filter(
        (t) => typeof t === "string" && t.trim() !== "",
      );
    }

  const doc = new LearningDoc({
    title: title.trim(),
    content,
    tags: processedTags,
    filename: filename.trim(),
  });

  await doc.save();
  res.status(201).json(doc);
});

export const deleteDoc = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await LearningDoc.findByIdAndDelete(id);
  if (!deleted) {
    throw AppError.notFound("Doc not found");
  }
  res.json({ message: "Doc deleted" });
});

export const updateDoc = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, tags, filename } = req.body;

  // Type validation
  if (typeof title !== "string" || !title.trim()) {
    throw AppError.badRequest("Valid title is required");
  }
  if (typeof content !== "string" || !content.trim()) {
    throw AppError.badRequest("Valid content is required");
  }
  if (
    typeof filename !== "string" ||
    !filename.trim() ||
    !filename.endsWith(".md")
  ) {
    throw AppError.badRequest("Valid markdown filename (.md) is required");
  }

    let processedTags: string[] = [];
    if (Array.isArray(tags)) {
      processedTags = tags.filter(
        (t) => typeof t === "string" && t.trim() !== "",
      );
    }

  const updatedDoc = await LearningDoc.findByIdAndUpdate(
    id,
    {
      title: title.trim(),
      content,
      tags: processedTags,
      filename: filename.trim(),
    },
    { new: true, runValidators: true }
  );

  if (!updatedDoc) {
    throw AppError.notFound("Doc not found");
  }

  res.json(updatedDoc);
});
