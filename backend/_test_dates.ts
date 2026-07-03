import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import TrackedProblem from "./src/models/TrackedProblem";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB.");

  const problems = await TrackedProblem.find({}).select("title lastAttemptedDate attemptCount").lean();
  console.log(`Found ${problems.length} tracked problems.`);

  const now = new Date();
  const todayServer = new Date();
  todayServer.setHours(0, 0, 0, 0);

  console.log("Server current time:", now.toISOString());
  console.log("Server 'today' start:", todayServer.toISOString());

  problems.forEach(p => {
    const attempted = new Date(p.lastAttemptedDate);
    const isToday = attempted >= todayServer;
    console.log(`- ${p.title}: ${attempted.toISOString()} (isToday: ${isToday})`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
