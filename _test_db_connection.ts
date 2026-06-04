/**
 * _test_db_connection.ts
 * Standalone script to verify MongoDB connection and basic model operations.
 * Run: export PATH="$HOME/.nvm/versions/node/v25.6.0/bin:$PATH" && npx tsx _test_db_connection.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import ProblemProgress from './src/models/ProblemProgress.ts';

async function testConnection() {
  console.log('=== MongoDB Connection Test ===\n');

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ FAIL: MONGODB_URI is not set in .env');
    process.exit(1);
  }

  console.log('1. Connecting to MongoDB...');
  try {
    const conn = await mongoose.connect(uri);
    console.log(`   ✅ PASS: Connected to ${conn.connection.host}`);
  } catch (error) {
    console.error(`   ❌ FAIL: ${(error as Error).message}`);
    process.exit(1);
  }

  console.log('2. Querying ProblemProgress count...');
  try {
    const count = await ProblemProgress.countDocuments();
    console.log(`   ✅ PASS: ${count} documents in ProblemProgress collection`);
  } catch (error) {
    console.error(`   ❌ FAIL: ${(error as Error).message}`);
  }

  console.log('3. Testing upsert operation...');
  try {
    const testSlug = '__test_connection_slug__';
    await ProblemProgress.findOneAndUpdate(
      { titleSlug: testSlug },
      { titleSlug: testSlug, title: 'Test Connection Problem', url: 'https://leetcode.com/problems/test/' },
      { upsert: true, new: true }
    );
    console.log('   ✅ PASS: Upsert succeeded');

    // Clean up test data
    await ProblemProgress.deleteOne({ titleSlug: testSlug });
    console.log('   ✅ PASS: Cleanup succeeded');
  } catch (error) {
    console.error(`   ❌ FAIL: ${(error as Error).message}`);
  }

  console.log('\n4. Disconnecting...');
  await mongoose.connection.close();
  console.log('   ✅ PASS: Disconnected cleanly');

  console.log('\n=== All tests passed ===');
}

testConnection().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
