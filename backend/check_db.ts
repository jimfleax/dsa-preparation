import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri as string)
  .then(async () => {
    const Track = mongoose.connection.collection("tracks");
    const count = await Track.countDocuments();
    console.log("Total tracks:", count);
    const tracks = await Track.find().toArray();
    console.log("Tracks:", JSON.stringify(tracks, null, 2).slice(0, 500));
    process.exit(0);
  })
  .catch(console.error);
