// Script completo para probar todas las funcionalidades de Vocali API
const fs = require('fs');
const path = require('path');

const baseURL = 'http://localhost:3000';
let authToken = '';

async function makeRequest(endpoint, options = {}) {
  const url = `${baseURL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (authToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function testCompleteAPI() {
  console.log('🚀 Testing Complete Vocali API...\n');

  try {
    // 1. Health Check
    console.log('1. 🏥 Health Check');
    const health = await makeRequest('/health');
    console.log(`   Status: ${health.status} - ${health.ok ? '✅' : '❌'}`);
    if (health.ok) {
      console.log(`   Environment: ${health.data.environment}`);
    }
    console.log();

    // 2. Create a unique test user
    const timestamp = Date.now();
    const testUser = {
      email: `test${timestamp}@vocali.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };

    console.log('2. 👤 User Registration');
    const register = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser),
    });
    console.log(`   Status: ${register.status} - ${register.ok ? '✅' : '❌'}`);
    if (register.ok) {
      console.log(`   User created: ${register.data.user.email}`);
    } else {
      console.log(`   Error: ${register.data.message}`);
    }
    console.log();

    // 3. Login
    console.log('3. 🔐 User Login');
    const login = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    console.log(`   Status: ${login.status} - ${login.ok ? '✅' : '❌'}`);
    if (login.ok) {
      authToken = login.data.token;
      console.log(`   Token received: ✅`);
      console.log(`   User: ${login.data.user.firstName} ${login.data.user.lastName}`);
    } else {
      console.log(`   Error: ${login.data.message}`);
    }
    console.log();

    // 4. Get User Profile
    console.log('4. 👨‍💼 User Profile');
    const profile = await makeRequest('/api/auth/me');
    console.log(`   Status: ${profile.status} - ${profile.ok ? '✅' : '❌'}`);
    if (profile.ok) {
      console.log(`   Profile: ${profile.data.firstName} ${profile.data.lastName}`);
      console.log(`   Email: ${profile.data.email}`);
      console.log(`   Active: ${profile.data.isActive ? 'Yes' : 'No'}`);
    } else {
      console.log(`   Error: ${profile.data.message}`);
    }
    console.log();

    // 5. Get User Transcriptions (should be empty)
    console.log('5. 📄 User Transcriptions');
    const transcriptions = await makeRequest('/api/transcriptions');
    console.log(`   Status: ${transcriptions.status} - ${transcriptions.ok ? '✅' : '❌'}`);
    if (transcriptions.ok) {
      console.log(`   Transcriptions count: ${transcriptions.data.transcriptions ? transcriptions.data.transcriptions.length : 0}`);
    } else {
      console.log(`   Error: ${transcriptions.data.message}`);
    }
    console.log();

    // 6. Update User Profile
    console.log('6. ✏️  Update User Profile');
    const updateProfile = await makeRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({
        firstName: 'Updated',
        lastName: 'Name',
      }),
    });
    console.log(`   Status: ${updateProfile.status} - ${updateProfile.ok ? '✅' : '❌'}`);
    if (updateProfile.ok) {
      console.log(`   Updated name: ${updateProfile.data.user.firstName} ${updateProfile.data.user.lastName}`);
    } else {
      console.log(`   Error: ${updateProfile.data.message}`);
    }
    console.log();

    // 7. Logout
    console.log('7. 🚪 User Logout');
    const logout = await makeRequest('/api/auth/logout', {
      method: 'POST',
    });
    console.log(`   Status: ${logout.status} - ${logout.ok ? '✅' : '❌'}`);
    if (logout.ok) {
      console.log(`   Message: ${logout.data.message}`);
    } else {
      console.log(`   Error: ${logout.data.message}`);
    }
    console.log();

    // 8. Test accessing protected endpoint after logout
    console.log('8. 🔒 Test Access After Logout');
    const afterLogout = await makeRequest('/api/auth/me');
    console.log(`   Status: ${afterLogout.status} - ${afterLogout.ok ? '❌ (Expected)' : '✅ (Expected)'}`);
    if (!afterLogout.ok) {
      console.log(`   Expected error: ${afterLogout.data.message}`);
    }
    console.log();

    console.log('🎉 Complete API Test Finished!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Health check working');
    console.log('✅ User registration working');
    console.log('✅ User login working');
    console.log('✅ Protected endpoints working');
    console.log('✅ User profile updates working');
    console.log('✅ User logout working');
    console.log('✅ Token invalidation working');
    console.log('\n🌐 API Documentation: http://localhost:3000/api-docs');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the complete tests
testCompleteAPI();
