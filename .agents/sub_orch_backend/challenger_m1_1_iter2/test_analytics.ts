import mongoose from "mongoose";
import User from "../../backend/src/models/User";
import Track from "../../backend/src/models/Track";
import TrackedProblem from "../../backend/src/models/TrackedProblem";
import { getAnalytics } from "../../backend/src/controllers/admin/analyticsController";
import dotenv from "dotenv";

dotenv.config({ path: "../../backend/.env" });

async function run() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dsa-test",
  );

  // Clean up
  await User.deleteMany({});
  await Track.deleteMany({});
  await TrackedProblem.deleteMany({});

  // 1. Create a user
  const user = await User.create({
    clerkId: "user_1",
    email: "test@example.com",
  });

  // 2. Create a track with "two-sum"
  const track = await Track.create({
    title: "[TEST] Two Sum Track",
    description: "This is a test track created to verify analytics",
    problems: [
      {
        titleSlug: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
      },
    ],
    order: 1,
  });

  // 3. Create TrackedProblem for "two-sum"
  await TrackedProblem.create({
    userId: "user_1",
    titleSlug: "two-sum",
    title: "Two Sum",
    attemptCount: 1,
    lastAttemptedDate: new Date(),
  });

  // 4. Create TrackedProblem for "three-sum" (outside track)
  await TrackedProblem.create({
    userId: "user_1",
    titleSlug: "three-sum",
    title: "Three Sum",
    attemptCount: 1,
    lastAttemptedDate: new Date(),
  });

  // Mock res
  let responseData: any;
  const req: any = {};
  const res: any = {
    json: (data: any) => {
      responseData = data;
    },
    status: (code: number) => ({
      json: (data: any) => {
        responseData = data;
      },
    }),
  };

  await getAnalytics(req, res);

  console.log(JSON.stringify(responseData, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
