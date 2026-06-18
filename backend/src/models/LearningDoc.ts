import mongoose, { Document, Schema } from "mongoose";

export interface ILearningDoc extends Document {
  filename: string;
  title: string;
  tags: string[];
  content: string; // The markdown content
  createdAt: Date;
  updatedAt: Date;
}

const LearningDocSchema = new Schema<ILearningDoc>(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const LearningDoc = (mongoose.models.LearningDoc as mongoose.Model<ILearningDoc>) || mongoose.model<ILearningDoc>("LearningDoc", LearningDocSchema);
export default LearningDoc;
