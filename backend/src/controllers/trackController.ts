import { Request, Response } from "express";
import Track from "../models/Track.ts";

export const listTracks = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit as string))) : null;

    let query = Track.find().sort({ order: 1 });
    
    if (limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const [tracks, totalCount] = await Promise.all([
      query,
      limit ? Track.countDocuments() : Promise.resolve(0)
    ]);

    if (limit) {
      res.json({ 
        success: true, 
        tracks,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } else {
      res.json({ success: true, tracks });
    }
  } catch (error) {
    console.error("Error listing tracks:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
