import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const UserSchema = new mongoose.Schema(
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
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);

async function test() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/test",
    );
    await User.collection.drop().catch(() => {});

    // Create new user
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      googleId: "1234567890",
    });
    console.log("User created:", user);
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    await mongoose.disconnect();
  }
}

test();
