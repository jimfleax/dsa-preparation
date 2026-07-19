/**
 * Global Teardown — runs ONCE after all test suites complete.
 * Drops the test database and disconnects.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

export default async function globalTeardown() {
  dotenv.config({ path: ".env" });

  const testUri = process.env.TEST_MONGODB_URI;
  if (!testUri) return;

  try {
    await mongoose.connect(testUri);
    await mongoose.connection.db!.dropDatabase();
    await mongoose.disconnect();
  } catch {
    // Silently handle — DB may already be disconnected
  }
}
