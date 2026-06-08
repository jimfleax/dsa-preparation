import mongoose, { Document, Schema } from 'mongoose';

/**
 * Represents a tracked DSA problem in the database.
 * Every problem here is one the user has solved.
 * Revisiting increments attemptCount and updates lastAttemptedDate.
 *
 * Multi-tenant: each record is scoped to a specific userId (Clerk ID).
 * The compound index {userId, titleSlug} ensures a user can only have
 * one progress record per problem, while different users can track the same problem.
 */
export interface IProblemProgress extends Document {
  userId: string;
  titleSlug: string;
  title: string;
  url: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  attemptCount: number;
  lastAttemptedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemProgressSchema = new Schema<IProblemProgress>(
  {
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true,
    },
    titleSlug: {
      type: String,
      required: [true, 'titleSlug is required'],
      trim: true,
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
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: false,
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

// Compound unique index: a user can only have one progress record per problem
ProblemProgressSchema.index({ userId: 1, titleSlug: 1 }, { unique: true });

// Index for sorting by last attempted date
ProblemProgressSchema.index({ lastAttemptedDate: -1 });

export default mongoose.model<IProblemProgress>('ProblemProgress', ProblemProgressSchema);
