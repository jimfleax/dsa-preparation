import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await mongoose.connection.collection("admins").countDocuments();
    const userCount = await mongoose.connection.collection("users").countDocuments();
    console.log("Admins count:", count);
    console.log("Users count:", userCount);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

test();
