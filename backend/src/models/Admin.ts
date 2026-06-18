import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  name?: string;
  email: string;
  password?: string;
  googleId?: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: false },
  googleId: { type: String, required: false, unique: true, sparse: true },
  tokenVersion: { type: Number, default: 0 },
}, { timestamps: true });

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
