/**
 * _test_api_endpoints.ts
 * Standalone script to test the API endpoints against a running dev server.
 * Prerequisites: Server must be running on the configured port.
 * Run: export PATH="$HOME/.nvm/versions/node/v25.6.0/bin:$PATH" && npx tsx _test_api_endpoints.ts
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (error: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`           ${error.message}`);
    failed++;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function runTests() {
  console.log(`\n=== API Endpoint Tests ===`);
  console.log(`Target: ${BASE_URL}\n`);

  // 1. Health check
  await test('GET /api/health returns success', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.ok, `Status ${res.status}`);
    assert(data.success === true, 'Expected success: true');
    assert(typeof data.status === 'string', 'Expected status string');
  });

  // 2. List problems (may be empty)
  await test('GET /api/problems returns array', async () => {
    const res = await fetch(`${BASE_URL}/api/problems`);
    const data = await res.json();
    assert(res.ok, `Status ${res.status}`);
    assert(data.success === true, 'Expected success: true');
    assert(Array.isArray(data.problems), 'Expected problems array');
    assert(typeof data.count === 'number', 'Expected count number');
  });

  // 3. Add a problem
  await test('POST /api/problems adds a new problem', async () => {
    const res = await fetch(`${BASE_URL}/api/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://leetcode.com/problems/two-sum/' }),
    });
    const data = await res.json();
    // Could be 201 (created) or 409 (already exists) - both are valid
    assert(res.status === 201 || res.status === 409, `Unexpected status ${res.status}`);
    if (res.status === 201) {
      assert(data.success === true, 'Expected success: true');
      assert(data.problem.titleSlug === 'two-sum', 'Expected titleSlug: two-sum');
    }
  });

  // 4. Add problem with invalid URL
  await test('POST /api/problems rejects invalid URL', async () => {
    const res = await fetch(`${BASE_URL}/api/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://google.com/not-a-problem' }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // 5. Sync endpoint
  await test('POST /api/sync returns sync result', async () => {
    const res = await fetch(`${BASE_URL}/api/sync`, { method: 'POST' });
    const data = await res.json();
    // May succeed or fail depending on env config - we just check the shape
    if (res.ok) {
      assert(data.success === true, 'Expected success: true');
      assert(typeof data.synced === 'number', 'Expected synced number');
      assert(typeof data.total === 'number', 'Expected total number');
    } else {
      // 500 if LEETCODE_USERNAME not set, 502 if API unreachable - both acceptable in test
      assert(typeof data.error === 'string', 'Expected error message');
    }
  });

  // 6. List problems with filters
  await test('GET /api/problems?status=solved works', async () => {
    const res = await fetch(`${BASE_URL}/api/problems?status=solved`);
    const data = await res.json();
    assert(res.ok, `Status ${res.status}`);
    assert(data.success === true, 'Expected success: true');
    assert(Array.isArray(data.problems), 'Expected problems array');
  });

  // 7. List problems with search
  await test('GET /api/problems?search=two works', async () => {
    const res = await fetch(`${BASE_URL}/api/problems?search=two`);
    const data = await res.json();
    assert(res.ok, `Status ${res.status}`);
    assert(data.success === true, 'Expected success: true');
  });

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
