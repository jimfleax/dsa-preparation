import mongoose from "mongoose";
import request from "supertest";
import app from "./app.ts";
import { generateFakeToken } from "./__tests__/setup/testHelpers.ts";
import { Admin } from "./src/models/Admin.ts";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function run() {
  await mongoose.connect(process.env.TEST_MONGODB_URI || process.env.MONGODB_URI!);
  const admin = await Admin.create({ name: "T", email: "t@t.com", googleId: "123", tokenVersion: 0 });
  const token = jwt.sign({ id: admin._id.toString() }, process.env.JWT_SECRET!);
  const response = await request(app).post("/api/admin/tracks").set("Authorization", `Bearer ${token}`).send({ title: "New", description: "Desc", problems: [] });
  console.log("Status:", response.status);
  console.log("Body:", response.body);
  await Admin.deleteMany({});
  await mongoose.disconnect();
}
run().catch(console.error);
