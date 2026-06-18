import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  googleId?: string;
  leetcodeUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    leetcodeUsername: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true },
);

// Pre-save or other hooks can go here if needed in the future



export default mongoose.model<IUser>("User", UserSchema);
