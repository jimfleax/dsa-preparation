/**
 * _test_api_endpoints.ts
 * Standalone script to test the API endpoints against a running dev server.
 * Prerequisites: Server must be running on the configured port.
 * Run: export PATH="$HOME/.nvm/versions/node/v25.6.0/bin:$PATH" && npx tsx _test_api_endpoints.ts
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
let passed = 0;
let failed = 0;
let testProblemId: string | null = null;

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
      assert(data.problem.isSolved === false, 'New problem should be unsolved');
      assert(data.problem.attemptCount === 0, 'New problem should have 0 attempts');
      testProblemId = data.problem._id;
    } else {
      // Already exists — fetch the list to get its ID for subsequent tests
      const listRes = await fetch(`${BASE_URL}/api/problems?search=two-sum`);
      const listData = await listRes.json();
      if (listData.problems.length > 0) {
        testProblemId = listData.problems[0]._id;
      }
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

  // 5. Toggle solved status
  if (testProblemId) {
    await test('PATCH /api/problems/:id/solve marks problem as solved', async () => {
      const res = await fetch(`${BASE_URL}/api/problems/${testProblemId}/solve`, {
        method: 'PATCH',
      });
      const data = await res.json();
      assert(res.ok, `Status ${res.status}`);
      assert(data.success === true, 'Expected success: true');
      assert(data.problem.isSolved === true, 'Expected isSolved: true after toggle');
      assert(data.problem.attemptCount >= 1, 'Expected attemptCount >= 1');
      assert(data.problem.lastSolvedDate !== null, 'Expected lastSolvedDate to be set');
    });

    await test('PATCH /api/problems/:id/solve toggles back to unsolved', async () => {
      const res = await fetch(`${BASE_URL}/api/problems/${testProblemId}/solve`, {
        method: 'PATCH',
      });
      const data = await res.json();
      assert(res.ok, `Status ${res.status}`);
      assert(data.problem.isSolved === false, 'Expected isSolved: false after second toggle');
      // attemptCount should NOT decrement when toggling back
      assert(data.problem.attemptCount >= 1, 'attemptCount should be preserved');
    });
  }

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

  // 8. Delete problem (cleanup)
  if (testProblemId) {
    await test('DELETE /api/problems/:id removes problem', async () => {
      const res = await fetch(`${BASE_URL}/api/problems/${testProblemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      assert(res.ok, `Status ${res.status}`);
      assert(data.success === true, 'Expected success: true');
    });
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
