import mongoose from "mongoose";
import "dotenv/config";
import Track from "./src/models/Track";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dsa-tracker";

const verifySeeding = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for verification...");

    const tracks = await Track.find({}).sort({ order: 1 });
    console.log(`Found ${tracks.length} tracks in database.`);

    const expectedTitles = [
      "Blind 75",
      "NeetCode 150",
      "Striver's A2Z DSA Course",
      "Two Pointers & Sliding Window"
    ];

    let allOk = true;
    for (let i = 0; i < expectedTitles.length; i++) {
      const track = tracks[i];
      if (!track) {
        console.error(`❌ Expected track at index ${i} to exist, but it was undefined.`);
        allOk = false;
        continue;
      }
      if (track.title !== expectedTitles[i]) {
        console.error(`❌ Expected track ${i} title to be "${expectedTitles[i]}", got "${track.title}"`);
        allOk = false;
      } else {
        console.log(`✅ Track ${i + 1}: "${track.title}" (order: ${track.order}) contains ${track.problems.length} problems.`);
      }
    }

    if (allOk && tracks.length === expectedTitles.length) {
      console.log("🎉 ALL SEED VERIFICATIONS PASSED!");
    } else {
      console.log("❌ SEED VERIFICATION FAILED.");
    }
  } catch (error) {
    console.error("Verification error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

verifySeeding();
