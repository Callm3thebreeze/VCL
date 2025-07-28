// Script maestro para ejecutar todos los tests
const {
  testDatabaseConnection,
} = require('./integration/database-connection-test');
const { testAppBasics } = require('./integration/app-test');
const { testBasicEndpoints } = require('./api/basic-endpoints-test');
const { testCompleteAPI } = require('./api/complete-api-test');

async function runAllTests() {
  console.log('🧪 Running All Vocali Backend Tests...\n');
  console.log('='.repeat(50));

  try {
    // 1. Test database connection
    console.log('\n🗄️  PHASE 1: Database Connection Tests');
    console.log('='.repeat(50));
    await testDatabaseConnection();

    // 2. Test app basics
    console.log('\n🚀 PHASE 2: App Basics Tests');
    console.log('='.repeat(50));
    await testAppBasics();

    // 3. Test basic endpoints
    console.log('\n🔧 PHASE 3: Basic Endpoints Tests');
    console.log('='.repeat(50));
    await testBasicEndpoints();

    // 4. Test complete API
    console.log('\n🎯 PHASE 4: Complete API Tests');
    console.log('='.repeat(50));
    await testCompleteAPI();

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY! 🎉');
    console.log('='.repeat(50));
    console.log('\n📊 Final Summary:');
    console.log('✅ Database connection and structure');
    console.log('✅ Server health and documentation');
    console.log('✅ Basic endpoint functionality');
    console.log('✅ Complete API workflow');
    console.log('✅ Authentication and authorization');
    console.log('✅ User management');
    console.log('✅ Transcription services');
    console.log('\n🚀 Vocali Backend is fully operational!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Función para ejecutar tests específicos
async function runSpecificTest(testName) {
  switch (testName) {
    case 'database':
    case 'db':
      await testDatabaseConnection();
      break;
    case 'app':
    case 'basic':
      await testAppBasics();
      break;
    case 'endpoints':
    case 'api':
      await testBasicEndpoints();
      break;
    case 'complete':
    case 'full':
      await testCompleteAPI();
      break;
    default:
      console.log('Available tests: database, app, endpoints, complete');
      console.log('Usage: node test-runner.js [test-name]');
      console.log('Or run without arguments to execute all tests');
  }
}

// Ejecutar tests según argumentos de línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    runAllTests();
  } else {
    runSpecificTest(args[0]);
  }
}

module.exports = {
  runAllTests,
  runSpecificTest,
  testDatabaseConnection,
  testAppBasics,
  testBasicEndpoints,
  testCompleteAPI,
};
