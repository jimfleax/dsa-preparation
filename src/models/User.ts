import mongoose, { Document, Schema } from 'mongoose';

/**
 * Lightweight user profile linked to Clerk.
 * Stores per-user configuration (e.g. LeetCode username) that
 * cannot be kept in Clerk's own metadata.
 */
export interface IUser extends Document {
  clerkUserId: string;
  leetcodeUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkUserId: {
      type: String,
      required: [true, 'clerkUserId is required'],
      unique: true,
      index: true,
    },
    leetcodeUsername: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
