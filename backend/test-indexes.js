import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    googleId: { type: String, required: false, unique: true, sparse: true },
    leetcodeUsername: { type: String, required: false },
    tokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const indexes = await User.collection.indexes();
    console.log("Indexes:", indexes);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

test();
