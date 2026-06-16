// Using global fetch in Node.js 18+

async function run() {
  console.log('🧪 API ENDPOINTS VERIFICATION TEST');
  console.log('==================================');

  const credentials = {
    email: 'hazemhazem@gmail.com',
    mot_de_passe: 'Admin123456'
  };

  try {
    // 1. Login
    console.log('\n📌 1. Sending Login request...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    console.log('✅ Login Succeeded. OTP code (dev):', loginData.devOtp);
    const userId = loginData.userId;
    const otp = loginData.devOtp;

    // 2. Verify OTP
    console.log('\n📌 2. Verification of OTP...');
    const verifyRes = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, otp })
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      throw new Error(`OTP Verify failed: ${JSON.stringify(verifyData)}`);
    }

    const token = verifyData.token;
    console.log('✅ OTP Verified. Received Token.');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 3. Test Dashboard Stats
    console.log('\n📌 3. Fetching /api/dashboard/stats ...');
    const statsRes = await fetch('http://localhost:5000/api/dashboard/stats', { headers });
    const statsData = await statsRes.json();
    if (!statsRes.ok) {
      console.error('❌ Stats error:', statsData);
    } else {
      console.log('✅ Stats retrieved successfully. KPI Total Tickets:', statsData.kpis?.total);
    }

    // 4. Test Dashboard Tickets
    console.log('\n📌 4. Fetching /api/dashboard/tickets ...');
    const ticketsRes = await fetch('http://localhost:5000/api/dashboard/tickets', { headers });
    const ticketsData = await ticketsRes.json();
    if (!ticketsRes.ok) {
      console.error('❌ Tickets error:', ticketsData);
    } else {
      console.log('✅ Tickets retrieved successfully. Ticket count:', ticketsData.length);
    }

    // 5. Test Alertes
    console.log('\n📌 5. Fetching /api/alertes ...');
    const alertesRes = await fetch('http://localhost:5000/api/alertes', { headers });
    const alertesData = await alertesRes.json();
    if (!alertesRes.ok) {
      console.error('❌ Alertes error:', alertesData);
    } else {
      console.log('✅ Alertes retrieved successfully!');
      console.log('   - Total alertes:', alertesData.stats?.total);
      console.log('   - Activations alertes count:', alertesData.activations?.length);
      console.log('   - Resiliations alertes count:', alertesData.resiliations?.length);
      console.log('   - Plaintes alertes count:', alertesData.plaintes?.length);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

run();
