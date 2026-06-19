import { Request, Response } from "express";
import Track from "../../models/Track.js";

export const getTracks = async (req: Request, res: Response) => {
  try {
    const tracks = await Track.find();
    res.json(tracks);
  } catch (error) {
    console.error("Get tracks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createTrack = async (req: Request, res: Response) => {
  try {
    const track = new Track(req.body);
    await track.save();
    res.status(201).json(track);
  } catch (error) {
    console.error("Create track error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTrack = async (req: Request, res: Response) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }
    res.json(track);
  } catch (error) {
    console.error("Update track error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteTrack = async (req: Request, res: Response) => {
  try {
    const track = await Track.findByIdAndDelete(req.params.id);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }
    res.json({ message: "Track deleted successfully" });
  } catch (error) {
    console.error("Delete track error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
