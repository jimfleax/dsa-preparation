import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Admin } from "./src/models/Admin.js";
import User from "./src/models/User.js";
import Track from "./src/models/Track.js";
import TrackedProblem from "./src/models/TrackedProblem.js";
import { getAnalytics } from "./src/controllers/admin/analyticsController.js";

async function runEdgeCaseTest() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  try {
    // 1 user, 1 track with 1 problem (two-sum)
    await User.create({ name: "User1", email: "user1@example.com" });
    await Track.create({
      title: "Track1",
      description: "Test Track",
      problems: [{ title: "Two Sum", titleSlug: "two-sum", difficulty: "Easy", url: "http" }]
    });

    // User solves a problem IN the track
    await TrackedProblem.create({
      userId: "fake-user-1",
      titleSlug: "two-sum",
      title: "Two Sum",
      attemptCount: 1,
    });

    // User solves a problem NOT in the track
    await TrackedProblem.create({
      userId: "fake-user-1",
      titleSlug: "three-sum",
      title: "Three Sum",
      attemptCount: 1,
    });

    // Mock Express Req/Res
    let responseData: any;
    const req = {} as any;
    const res = {
      json: (data: any) => { responseData = data; },
      status: (code: number) => ({ json: (data: any) => { responseData = data; } })
    } as any;

    await getAnalytics(req, res);
    
    console.log("Analytics Output:", JSON.stringify(responseData, null, 2));

    const totalProblemsAvailable = responseData.content.totalProblemsAvailable; // 1
    const totalUsers = responseData.users.total; // 1
    const expectedInteractions = totalProblemsAvailable * totalUsers; // 1 * 1 = 1
    
    const solved = responseData.completionRate.solved; // 2
    const revising = responseData.completionRate.revising; // 0
    const unsolved = responseData.completionRate.unsolved; // 0
    
    if (solved + revising > expectedInteractions) {
      console.log("BUG DETECTED: solved + revising > totalPossibleInteractions");
    } else {
      console.log("OK: Numbers align.");
    }
    
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

runEdgeCaseTest();
