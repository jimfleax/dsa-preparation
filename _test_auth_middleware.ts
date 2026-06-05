/**
 * _test_auth_middleware.ts
 *
 * Verification test: Ensures protected endpoints reject unauthenticated requests.
 * Run: export PATH="$HOME/.nvm/versions/node/v25.6.0/bin:$PATH" && npx tsx _test_auth_middleware.ts
 *
 * Expected: All protected endpoints return 401 Unauthorized when no auth header is provided.
 */

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  pass: boolean;
}

async function testEndpoint(method: string, path: string): Promise<TestResult> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      // Intentionally NO Authorization header
      ...(method === 'POST' ? { body: JSON.stringify({ url: 'https://leetcode.com/problems/two-sum/' }) } : {}),
    });

    return {
      endpoint: `${method} ${path}`,
      method,
      status: response.status,
      pass: response.status === 401,
    };
  } catch (err: any) {
    console.error(`  ❌ Network error for ${method} ${path}:`, err.message);
    return { endpoint: `${method} ${path}`, method, status: -1, pass: false };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Auth Middleware Enforcement Test');
  console.log(`  Target: ${API_BASE}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Test 1: Public endpoints should still work (200)
  console.log('── Public Endpoints (should return 200) ──');
  const healthRes = await fetch(`${API_BASE}/api/health`);
  console.log(`  GET /api/health → ${healthRes.status} ${healthRes.status === 200 ? '✅ PASS' : '❌ FAIL'}`);

  const docsRes = await fetch(`${API_BASE}/api/documents`);
  console.log(`  GET /api/documents → ${docsRes.status} ${docsRes.status === 200 ? '✅ PASS' : '❌ FAIL'}`);

  // Test 2: Protected endpoints without auth (should return 401)
  console.log('\n── Protected Endpoints (should return 401) ──');
  const protectedTests: [string, string][] = [
    ['GET', '/api/problems'],
    ['POST', '/api/problems'],
    ['PATCH', '/api/problems/507f1f77bcf86cd799439011/revisit'],
    ['DELETE', '/api/problems/507f1f77bcf86cd799439011'],
    ['GET', '/api/user/settings'],
    ['POST', '/api/user/settings'],
    ['POST', '/api/sync'],
  ];

  const results: TestResult[] = [];
  for (const [method, path] of protectedTests) {
    const result = await testEndpoint(method, path);
    results.push(result);
    console.log(`  ${result.endpoint} → ${result.status} ${result.pass ? '✅ PASS' : '❌ FAIL'}`);
  }

  // Summary
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  Results: ${passed}/${total} passed ${passed === total ? '✅ ALL CLEAR' : '❌ FAILURES DETECTED'}`);
  console.log(`═══════════════════════════════════════════════════`);

  process.exit(passed === total ? 0 : 1);
}

main();
