import mongoose, { Schema, Document } from "mongoose";

export interface TrackProblem {
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
}

export interface TrackPart {
  title: string;
  description?: string;
  problems: TrackProblem[];
}

export interface ITrack extends Document {
  title: string;
  description: string;
  order: number;
  problems: TrackProblem[];
  parts?: TrackPart[];
}

const ProblemSchema = {
  title: { type: String, required: true },
  titleSlug: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  url: { type: String, required: true },
};

const TrackSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    problems: [ProblemSchema],
    parts: [
      {
        title: { type: String, required: true },
        description: { type: String },
        problems: [ProblemSchema],
      },
    ],
  },
  { timestamps: true },
);

TrackSchema.index({ order: 1 });

export default mongoose.models.Track ||
  mongoose.model<ITrack>("Track", TrackSchema);
