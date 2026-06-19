import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getAnalytics } from "./src/controllers/admin/analyticsController";
import User from "./src/models/User";
import Track from "./src/models/Track";
import TrackedProblem from "./src/models/TrackedProblem";

async function run() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create User
  await User.create({
    clerkId: "user_1",
    email: "test@example.com",
    name: "Test",
  });

  // Create Track
  await Track.create({
    title: "Test Track",
    description: "Testing",
    problems: [
      {
        title: "Two Sum",
        titleSlug: "two-sum",
        difficulty: "Easy",
        url: "http://example.com/1",
      },
    ],
  });

  // Create TrackedProblems
  await TrackedProblem.create({
    userId: "user_1",
    titleSlug: "two-sum",
    title: "Two Sum",
    attemptCount: 1,
  });

  await TrackedProblem.create({
    userId: "user_1",
    titleSlug: "three-sum",
    title: "Three Sum",
    attemptCount: 1,
  });

  // Mock req/res
  const res = {
    json: (data: any) => {
      console.log(JSON.stringify(data, null, 2));
    },
    status: (code: number) => {
      return { json: (data: any) => console.log(code, data) };
    },
  };

  await getAnalytics({} as any, res as any);

  await mongoose.disconnect();
  await mongoServer.stop();
}

run().catch(console.error);
