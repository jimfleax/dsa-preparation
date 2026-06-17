import { getApiCacheDb } from './src/lib/apiCache';

async function test() {
  try {
    console.log("Creating RxDB...");
    await getApiCacheDb();
    console.log("Success");
  } catch (err) {
    console.error("Caught error:", err);
  }
}

test();
