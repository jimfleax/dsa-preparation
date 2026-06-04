import mongoose, { Document, Schema } from 'mongoose';

/**
 * Represents a tracked DSA problem in the database.
 * Every problem here is one the user has solved.
 * Revisiting increments attemptCount and updates lastAttemptedDate.
 */
export interface IProblemProgress extends Document {
  titleSlug: string;
  title: string;
  url: string;
  attemptCount: number;
  lastAttemptedDate: Date;
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
    attemptCount: {
      type: Number,
      default: 1,
      min: [1, 'attemptCount must be at least 1'],
    },
    lastAttemptedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for sorting by last attempted date
ProblemProgressSchema.index({ lastAttemptedDate: -1 });

export default mongoose.model<IProblemProgress>('ProblemProgress', ProblemProgressSchema);
