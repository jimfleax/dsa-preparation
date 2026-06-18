import { Request, Response } from 'express';
import LearningDoc from '../../models/LearningDoc.ts';

export const getDocs = async (req: Request, res: Response) => {
  try {
    const docs = await LearningDoc.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createDoc = async (req: Request, res: Response) => {
  try {
    const { title, content, tags, filename } = req.body;
    if (!title || !content || !filename) {
      return res.status(400).json({ error: 'Title, content and filename are required' });
    }
    const doc = new LearningDoc({ title, content, tags, filename });
    await doc.save();
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteDoc = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await LearningDoc.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Doc not found' });
    }
    res.json({ message: 'Doc deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
