import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import request from "supertest";
import bcrypt from "bcryptjs";

// Set fake JWT secret
process.env.JWT_SECRET = "test-secret";

import adminRoutes from "./src/routes/admin/index.js";
import { Admin } from "./src/models/Admin.js";
import User from "./src/models/User.js";
import Track from "./src/models/Track.js";
import TrackedProblem from "./src/models/TrackedProblem.js";

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

async function runTests() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  console.log("Connected to in-memory db.");

  try {
    // 1. Unauth test
    let res = await request(app).get("/api/admin/users");
    if (res.status !== 401)
      throw new Error("Expected 401 for /api/admin/users");

    // 2. Auth - Login
    const pwdHash = await bcrypt.hash("password123", 10);
    await Admin.create({ email: "admin@example.com", password: pwdHash });

    res = await request(app).post("/api/admin/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    if (res.status !== 200)
      throw new Error("Expected 200 for login, got: " + res.status);
    const token = res.body.token;
    if (!token) throw new Error("No token returned");

    // 3. Analytics data setup
    await User.create({ name: "User1", email: "user1@example.com" });
    await Track.create({
      title: "Track1",
      description: "Test Track",
      problems: [
        {
          title: "Two Sum",
          titleSlug: "two-sum",
          difficulty: "Easy",
          url: "http",
        },
      ],
    });
    await TrackedProblem.create({
      userId: "fake-id",
      titleSlug: "two-sum",
      title: "Two Sum",
      attemptCount: 1,
    });

    // 4. Test Analytics
    res = await request(app)
      .get("/api/admin/analytics")
      .set("Authorization", `Bearer ${token}`);

    if (res.status !== 200) throw new Error("Analytics failed: " + res.text);
    console.log("Analytics output:", res.body);

    if (res.body.users.total !== 1)
      throw new Error("Analytics users.total mismatch");
    if (res.body.content.totalTracks !== 1)
      throw new Error("Analytics totalTracks mismatch");
    if (res.body.engagement.mostActiveTracks.length !== 1)
      throw new Error("Analytics mostActiveTracks length mismatch");

    console.log("ALL TESTS PASSED SUCCESSFULLY");
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

runTests();
