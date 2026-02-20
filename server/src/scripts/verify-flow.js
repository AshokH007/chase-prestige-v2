const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

async function runVerification() {
    console.log('🔍 Starting End-to-End API Verification...\n');

    try {
        // 1. Health Check
        console.log('1️⃣  Testing Health Endpoint...');
        const healthRes = await fetch(`${BASE_URL}/health`);
        if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.status} ${healthRes.statusText}`);

        const health = await healthRes.json();
        if (health.status === 'ok') {
            console.log('✅ Health Check Passed');
        } else {
            throw new Error('Health check returned invalid status');
        }

        // 2. Login
        console.log('\n2️⃣  Testing Authentication (Login)...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: 'john@bank.com', password: 'SecurePass123' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;

        if (token) {
            console.log(`✅ Login Successful.`);
            console.log(`   User: ${loginData.user.fullName} (${loginData.user.email})`);
        } else {
            throw new Error('No token received');
        }

        // 3. Get Profile (Protected)
        console.log('\n3️⃣  Testing Protected Endpoint (Profile)...');
        const profileRes = await fetch(`${API_URL}/account/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.statusText}`);
        const profile = await profileRes.json();
        console.log(`✅ Profile Retrieved: Customer ID ${profile.customer_id}`);

        // 4. Get Balance (Protected)
        console.log('\n4️⃣  Testing Protected Endpoint (Balance)...');
        const balanceRes = await fetch(`${API_URL}/account/balance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!balanceRes.ok) throw new Error(`Balance fetch failed: ${balanceRes.statusText}`);
        const balanceData = await balanceRes.json();
        console.log(`✅ Balance Retrieved: $${balanceData.balance}`);

        // 5. Logout
        console.log('\n5️⃣  Testing Logout...');
        const logoutRes = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (logoutRes.ok) {
            console.log('✅ Logout Successful');
        } else {
            throw new Error('Logout failed');
        }

        // 6. Verify Token Revocation
        console.log('\n6️⃣  Verifying Token Revocation...');
        const revokedCheck = await fetch(`${API_URL}/account/balance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (revokedCheck.status === 401) {
            console.log('✅ Token successfully revoked (401 Unauthorized received as expected)');
        } else {
            throw new Error(`Security Flaw: Revoked token still works! Status: ${revokedCheck.status}`);
        }

        console.log('\n✨ ALL SYSTEM CHECKS PASSED ✨');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED');
        console.error(error.message);
        process.exit(1);
    }
}

runVerification();
