import mongoose, { Document, Schema } from 'mongoose';

/**
 * Represents a tracked DSA problem in the database.
 * Each problem is uniquely identified by its LeetCode titleSlug.
 */
export interface IProblemProgress extends Document {
  titleSlug: string;
  title: string;
  url: string;
  isSolved: boolean;
  attemptCount: number;
  lastSolvedDate: Date | null;
  syncedSubmissionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProblemProgressSchema = new Schema<IProblemProgress>(
  {
    titleSlug: {
      type: String,
      required: [true, 'titleSlug is required'],
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    isSolved: {
      type: Boolean,
      default: false,
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: [0, 'attemptCount cannot be negative'],
    },
    lastSolvedDate: {
      type: Date,
      default: null,
    },
    // Stores IDs of synced submissions to avoid counting the same one twice
    syncedSubmissionIds: [{ type: String }],
  },
  { timestamps: true }
);

// Compound index for common query patterns (filter by solved status + sort by date)
ProblemProgressSchema.index({ isSolved: 1, lastSolvedDate: -1 });

export default mongoose.model<IProblemProgress>('ProblemProgress', ProblemProgressSchema);
