import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProblemProgress from './src/models/ProblemProgress.js';

dotenv.config();

async function testSync() {
  if (!process.env.MONGO_URI) {
    console.error("No MONGO_URI provided.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Test the structure of a problem progress record
  const record = await ProblemProgress.findOne();
  if (record) {
    console.log("Found a record:", record.title);
    console.log("notrack flag is:", record.notrack);
  } else {
    console.log("No ProblemProgress records found in DB to test against.");
  }

  await mongoose.disconnect();
  console.log("Disconnected.");
}

testSync().catch(console.error);
