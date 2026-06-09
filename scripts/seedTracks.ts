import mongoose from "mongoose";
import "dotenv/config";
import fs from "fs";
import path from "path";
import Track from "../src/models/Track";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dsa-tracker";

const blind75 = {
  title: "Blind 75",
  description: "The top 75 LeetCode questions to help you prepare for technical interviews.",
  order: 1,
  problems: [
    {
      title: "Two Sum",
      titleSlug: "two-sum",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/two-sum/",
    },
    {
      title: "Best Time to Buy and Sell Stock",
      titleSlug: "best-time-to-buy-and-sell-stock",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    },
    {
      title: "Contains Duplicate",
      titleSlug: "contains-duplicate",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/contains-duplicate/",
    },
    {
      title: "Product of Array Except Self",
      titleSlug: "product-of-array-except-self",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/product-of-array-except-self/",
    },
    {
      title: "Maximum Subarray",
      titleSlug: "maximum-subarray",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/maximum-subarray/",
    },
  ],
};

const neetcode150 = {
  title: "NeetCode 150",
  description: "A comprehensive list of 150 LeetCode problems covering all essential topics.",
  order: 2,
  problems: [
    {
      title: "Valid Anagram",
      titleSlug: "valid-anagram",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/valid-anagram/",
    },
    {
      title: "Group Anagrams",
      titleSlug: "group-anagrams",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/group-anagrams/",
    },
    {
      title: "Top K Frequent Elements",
      titleSlug: "top-k-frequent-elements",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/top-k-frequent-elements/",
    },
    {
      title: "Encode and Decode Strings",
      titleSlug: "encode-and-decode-strings",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/encode-and-decode-strings/",
    },
  ],
};

const striverDataPath = path.join(process.cwd(), "scripts", "data", "striver_track.json");
const striverA2Z = JSON.parse(fs.readFileSync(striverDataPath, "utf-8"));

const twoPointersPath = path.join(process.cwd(), "scripts", "data", "two_pointers_sliding_window_track.json");
const twoPointersSlidingWindow = JSON.parse(fs.readFileSync(twoPointersPath, "utf-8"));

const seedTracks = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding Tracks...");

    await Track.deleteMany({});
    console.log("Cleared existing tracks.");

    await Track.create(blind75);
    await Track.create(neetcode150);
    await Track.create(striverA2Z);
    await Track.create(twoPointersSlidingWindow);

    console.log("Tracks seeded successfully!");
  } catch (error) {
    console.error("Error seeding tracks:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedTracks();
