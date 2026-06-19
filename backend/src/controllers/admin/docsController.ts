import { Request, Response } from "express";
import LearningDoc from "../../models/LearningDoc.js";

export const getDocs = async (req: Request, res: Response) => {
  try {
    const docs = await LearningDoc.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createDoc = async (req: Request, res: Response) => {
  try {
    const { title, content, tags, filename } = req.body;

    // Type validation
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Valid title is required" });
    }
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "Valid content is required" });
    }
    if (
      typeof filename !== "string" ||
      !filename.trim() ||
      !filename.endsWith(".md")
    ) {
      return res
        .status(400)
        .json({ error: "Valid markdown filename (.md) is required" });
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
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return res
        .status(409)
        .json({ error: "A document with this filename already exists" });
    }
    res.status(500).json({ error: "Server error while creating document" });
  }
};

export const deleteDoc = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await LearningDoc.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Doc not found" });
    }
    res.json({ message: "Doc deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
