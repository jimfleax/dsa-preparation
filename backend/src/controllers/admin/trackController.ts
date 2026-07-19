import { Request, Response } from "express";
import Track from "../../models/Track.js";
import { AppError } from "../../lib/AppError.ts";
import { catchAsync } from "../../lib/catchAsync.ts";

export const getTracks = catchAsync(async (req: Request, res: Response) => {
  const tracks = await Track.find();
  res.json(tracks);
});

export const createTrack = catchAsync(async (req: Request, res: Response) => {
  const track = new Track(req.body);
  await track.save();
  res.status(201).json(track);
});

export const updateTrack = catchAsync(async (req: Request, res: Response) => {
  const track = await Track.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  if (!track) {
    throw AppError.notFound("Track not found");
  }
  res.json(track);
});

export const deleteTrack = catchAsync(async (req: Request, res: Response) => {
  const track = await Track.findByIdAndDelete(req.params.id);
  if (!track) {
    throw AppError.notFound("Track not found");
  }
  res.json({ message: "Track deleted successfully" });
});
