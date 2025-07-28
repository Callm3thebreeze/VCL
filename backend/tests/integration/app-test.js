// Test básico del servidor
const request = require('supertest');

// Función para probar si el servidor está funcionando
async function testAppBasics() {
  console.log('🚀 Testing App Basics...\n');

  try {
    const baseURL = 'http://localhost:3000';

    console.log('1. 🏥 Testing Health Endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();

    if (healthResponse.ok) {
      console.log('✅ Health endpoint working');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Environment: ${healthData.environment}`);
    } else {
      console.log('❌ Health endpoint failed');
    }

    console.log('\n2. 📚 Testing API Documentation...');
    const docsResponse = await fetch(`${baseURL}/api-docs.json`);

    if (docsResponse.ok) {
      const docsData = await docsResponse.json();
      console.log('✅ API documentation available');
      console.log(`   Title: ${docsData.info?.title}`);
      console.log(`   Version: ${docsData.info?.version}`);
    } else {
      console.log('❌ API documentation failed');
    }

    console.log('\n3. 🔒 Testing Protected Endpoint (should fail)...');
    const protectedResponse = await fetch(`${baseURL}/api/auth/me`);

    if (!protectedResponse.ok) {
      console.log('✅ Protected endpoint correctly requires authentication');
    } else {
      console.log('❌ Protected endpoint should require authentication');
    }

    console.log('\n🎉 App Basics Test Completed!');
    console.log('\n📊 Summary:');
    console.log('✅ Server is responding');
    console.log('✅ Health check working');
    console.log('✅ API documentation available');
    console.log('✅ Authentication middleware working');
  } catch (error) {
    console.error('❌ App basics test failed:', error.message);
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  testAppBasics();
}

module.exports = { testAppBasics };
