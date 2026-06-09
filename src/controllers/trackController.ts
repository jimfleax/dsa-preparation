import { Request, Response } from "express";
import Track from "../models/Track";

export const listTracks = async (req: Request, res: Response) => {
  try {
    const tracks = await Track.find().sort({ order: 1 });
    res.json({ success: true, tracks });
  } catch (error) {
    console.error("Error listing tracks:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
