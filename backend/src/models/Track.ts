import mongoose, { Schema, Document } from "mongoose";

export interface TrackProblem {
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
}

export interface ITrack extends Document {
  title: string;
  description: string;
  order: number;
  problems: TrackProblem[];
}

const TrackSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    problems: [
      {
        title: { type: String, required: true },
        titleSlug: { type: String, required: true },
        difficulty: {
          type: String,
          enum: ["Easy", "Medium", "Hard"],
          required: true,
        },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.Track ||
  mongoose.model<ITrack>("Track", TrackSchema);
