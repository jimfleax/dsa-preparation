/**
 * Global Setup — runs ONCE before all test suites.
 * Connects to the test MongoDB and cleans all collections.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";

export default async function globalSetup() {
  // Load env vars
  dotenv.config({ path: ".env" });

  const testUri = process.env.TEST_MONGODB_URI;
  if (!testUri) {
    throw new Error(
      "TEST_MONGODB_URI is not set in .env. Cannot run tests without a test database.",
    );
  }

  // Connect to test database
  await mongoose.connect(testUri);

  // Drop all collections for a clean slate
  const collections = await mongoose.connection.db!.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }

  await mongoose.disconnect();

  // Store URI for use by tests via process.env
  process.env.MONGODB_URI = testUri;
}
