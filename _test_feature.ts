import http from 'http';

const API_BASE = 'http://localhost:3000';

async function testAuth() {
  console.log('--- Testing Native Auth API ---');
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `testuser_${timestamp}@example.com`,
    password: 'Password123!',
  };

  try {
    // 1. Register
    console.log(`\n[1] Registering user: ${testUser.email}`);
    const regRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const regData = await regRes.json();
    console.log('Registration Response:', regData);

    if (!regData.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }

    // 2. Login
    console.log(`\n[2] Logging in user: ${testUser.email}`);
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);

    if (!loginData.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    const token = loginData.token;

    // 3. Test protected route
    console.log(`\n[3] Testing protected route (/api/user/settings) with token`);
    const settingsRes = await fetch(`${API_BASE}/api/user/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const settingsData = await settingsRes.json();
    console.log('Settings Response:', settingsData);

    if (!settingsData.success) {
      throw new Error(`Protected route failed: ${settingsData.message || settingsData.error}`);
    }

    console.log('\n✅ All integration tests passed successfully!');

  } catch (err: any) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

testAuth();
