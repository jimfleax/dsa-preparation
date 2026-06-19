import "dotenv/config";
import mongoose from "mongoose";
import TrackedProblem from "./src/models/TrackedProblem.ts";
import { connectDB } from "./src/lib/db.ts";
import fetch from "node-fetch";

const query = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      title
      stats
    }
  }
`;

async function fetchAcCount(slug: string): Promise<string> {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        operationName: "questionData",
        variables: { titleSlug: slug },
        query,
      }),
    });
    const data = (await res.json()) as any;
    if (data.data && data.data.question && data.data.question.stats) {
      const stats = JSON.parse(data.data.question.stats);
      return stats.totalAccepted;
    }
  } catch (err) {
    return "Error";
  }
  return "N/A";
}

async function run() {
  try {
    await connectDB();
    const problems = await TrackedProblem.find({
      userId: "6a33f4b3f6dbb933463f715a",
    }).sort({ titleSlug: 1 });
    console.log(`| Problem | Accepted Submissions |`);
    console.log(`|---|---|`);
    for (const p of problems) {
      const ac = await fetchAcCount(p.titleSlug);
      console.log(`| ${p.title} | ${ac} |`);
      // Add a slight delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 200));
    }
  } catch (err) {
    console.error("Fatal error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
