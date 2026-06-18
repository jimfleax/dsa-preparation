import mongoose from 'mongoose';
import { Admin } from './src/models/Admin';
import User from './src/models/User';
import Track from './src/models/Track';
import TrackedProblem from './src/models/TrackedProblem';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getAnalytics } from './src/controllers/admin/analyticsController';
import { adminLogin } from './src/controllers/admin/authController';
import { requireAdminAuth } from './src/middleware/adminAuthMiddleware';
import jwt from 'jsonwebtoken';

async function runTests() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  console.log("Connected to in-memory db");

  process.env.JWT_SECRET = "test_secret";

  try {
    console.log("--- Testing Auth ---");
    const hashedPassword = await bcrypt.hash("pass123", 10);
    const admin = new Admin({ email: "admin@test.com", password: hashedPassword });
    await admin.save();

    const mockReqLogin = {
      body: { email: "admin@test.com", password: "pass123" }
    };
    
    let resJsonData: any = {};
    let statusCode = 200;
    const mockResLogin = {
      status: (code: number) => { statusCode = code; return mockResLogin; },
      json: (data: any) => { resJsonData = data; }
    };

    await adminLogin(mockReqLogin as any, mockResLogin as any);
    if (!resJsonData.token) throw new Error("Login failed, no token");
    console.log("Login Success! Token:", resJsonData.token);

    console.log("--- Testing Middleware ---");
    const mockReqMiddleware = {
      header: (name: string) => `Bearer ${resJsonData.token}`,
      admin: undefined as any
    };
    let nextCalled = false;
    const mockNext = () => { nextCalled = true; };
    await requireAdminAuth(mockReqMiddleware as any, mockResLogin as any, mockNext as any);
    if (!nextCalled || mockReqMiddleware.admin?.id !== admin.id) throw new Error("Middleware failed");
    console.log("Middleware Success! Admin ID attached:", mockReqMiddleware.admin.id);

    console.log("--- Testing Analytics ---");
    const now = new Date();
    // 2 users (1 old, 1 new)
    await new User({ id: "user1", email: "user1@test.com", name: "User", createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000) }).save();
    await new User({ id: "user2", email: "user2@test.com", name: "User", createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) }).save();

    // 2 Tracks
    const t1 = new Track({
      title: "Track 1",
      slug: "track-1",
      description: "T1",
      difficulty: "Easy",
      problems: [
        { title: "P1", titleSlug: "p1", difficulty: "Easy", url: "https://x" },
        { title: "P2", titleSlug: "p2", difficulty: "Easy", url: "https://x" }
      ]
    });
    await t1.save();
    
    const t2 = new Track({
      title: "Track 2",
      slug: "track-2",
      description: "T2",
      difficulty: "Medium",
      problems: [
        { title: "P2", titleSlug: "p2", difficulty: "Medium", url: "https://x" },
        { title: "P3", titleSlug: "p3", difficulty: "Hard", url: "https://x" }
      ]
    });
    await t2.save();

    // TrackedProblems
    await new TrackedProblem({ userId: "user1", titleSlug: "p1", title: "P1", attemptCount: 1 }).save(); // solved
    await new TrackedProblem({ userId: "user1", titleSlug: "p2", title: "P2", attemptCount: 2 }).save(); // revising
    await new TrackedProblem({ userId: "user2", titleSlug: "p2", title: "P2", attemptCount: 1 }).save(); // solved

    const mockReqAnalytics = {};
    let analyticsData: any = {};
    const mockResAnalytics = {
      status: (code: number) => mockResAnalytics,
      json: (data: any) => { analyticsData = data; }
    };

    await getAnalytics(mockReqAnalytics as any, mockResAnalytics as any);
    console.log("Analytics Data:", JSON.stringify(analyticsData, null, 2));

    if (analyticsData.users.total !== 2 || analyticsData.users.newLast30Days !== 1) throw new Error("Users metrics wrong");
    if (analyticsData.content.totalTracks !== 2 || analyticsData.content.totalProblemsAvailable !== 3) throw new Error("Content metrics wrong");
    if (analyticsData.engagement.totalProblemsSolvedGlobally !== 3) throw new Error("Global solved wrong");
    if (analyticsData.completionRate.solved !== 2 || analyticsData.completionRate.revising !== 1 || analyticsData.completionRate.unsolved !== 3) throw new Error("Completion rate wrong");
    
    console.log("Analytics Logic Verified successfully.");

    console.log("All tests passed!");
    process.exit(0);

  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runTests();
