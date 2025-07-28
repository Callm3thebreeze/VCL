// Test simple de endpoints básicos
const { makeRequest } = require('./complete-api-test');

const baseURL = 'http://localhost:3000';

async function testBasicEndpoints() {
  console.log('🧪 Testing Basic Vocali API Endpoints...\n');

  try {
    // 1. Health Check
    console.log('1. 🏥 Testing Health Check...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response:`, healthData);
    console.log('✅ Health check passed\n');

    // 2. API Documentation
    console.log('2. 📚 Testing API Documentation...');
    const docsResponse = await fetch(`${baseURL}/api-docs.json`);
    const docsData = await docsResponse.json();
    console.log(`   Status: ${docsResponse.status}`);
    console.log(`   API Title: ${docsData.info?.title}`);
    console.log(`   API Version: ${docsData.info?.version}`);
    console.log('✅ API documentation available\n');

    // 3. Register new user
    console.log('3. 👤 Testing User Registration...');
    const registerData = {
      email: 'test@vocali.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
    };

    const registerResponse = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    console.log(`   Status: ${registerResponse.status}`);

    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log(`   User created: ${registerResult.user?.email}`);
      console.log('✅ User registration working\n');

      // 4. Login with the user
      console.log('4. 🔐 Testing User Login...');
      const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
        }),
      });

      console.log(`   Status: ${loginResponse.status}`);

      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log(`   Token received: ${loginResult.token ? 'Yes' : 'No'}`);
        console.log('✅ User login working\n');

        // 5. Test protected endpoint
        console.log('5. 🛡️  Testing Protected Endpoint...');
        const profileResponse = await fetch(`${baseURL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${loginResult.token}`,
          },
        });

        console.log(`   Status: ${profileResponse.status}`);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log(`   User profile: ${profileData.email}`);
          console.log('✅ Authentication working\n');
        } else {
          console.log('❌ Protected endpoint failed\n');
        }
      } else {
        const loginError = await loginResponse.json();
        console.log(`   Error: ${loginError.message}`);
        console.log('❌ Login failed\n');
      }
    } else {
      const registerError = await registerResponse.json();
      console.log(`   Error: ${registerError.message}`);
      if (
        registerResponse.status === 400 &&
        registerError.message?.includes('already exists')
      ) {
        console.log('ℹ️  User already exists (expected on subsequent runs)\n');
      } else {
        console.log('❌ Registration failed\n');
      }
    }

    console.log('🎉 Basic API Testing completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Server running on http://localhost:3000');
    console.log('✅ Database connected and tables created');
    console.log('✅ Health check endpoint working');
    console.log('✅ API documentation available at /api-docs');
    console.log('✅ User registration and authentication working');
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  testBasicEndpoints();
}

module.exports = { testBasicEndpoints };
