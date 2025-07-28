// Test de conectividad con la base de datos
const database = require('../../src/config/database');

async function testDatabaseConnection() {
  console.log('🗄️  Testing Database Connection...\n');

  try {
    // Initialize database connection
    await database.initialize();

    // Test basic connection
    console.log('1. 🔌 Testing Basic Connection...');
    const testQuery = await database.query('SELECT 1 as test');
    console.log('✅ Database connection established');

    // Test simple query
    console.log('\n2. 📋 Testing Simple Query...');
    const result = await database.query('SELECT 1 as test');
    console.log(`✅ Query executed successfully: ${JSON.stringify(result)}`);

    // Test database and tables exist
    console.log('\n3. 🏗️  Testing Database Structure...');
    const tables = await database.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach((table) => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    // Test users table specifically
    console.log('\n4. 👥 Testing Users Table...');
    const userCount = await database.query(
      'SELECT COUNT(*) as count FROM users'
    );
    console.log(`✅ Users table has ${userCount[0].count} records`);

    // Test transcriptions table
    console.log('\n5. 📄 Testing Transcriptions Table...');
    const transcriptionCount = await database.query(
      'SELECT COUNT(*) as count FROM transcriptions'
    );
    console.log(
      `✅ Transcriptions table has ${transcriptionCount[0].count} records`
    );

    // Test session_tokens table
    console.log('\n6. 🔐 Testing Session Tokens Table...');
    const tokenCount = await database.query(
      'SELECT COUNT(*) as count FROM session_tokens'
    );
    console.log(`✅ Session tokens table has ${tokenCount[0].count} records`);

    // Test audio_files table
    console.log('\n7. 🎵 Testing Audio Files Table...');
    const audioCount = await database.query(
      'SELECT COUNT(*) as count FROM audio_files'
    );
    console.log(`✅ Audio files table has ${audioCount[0].count} records`);

    console.log('\n🎉 Database Connection Test Completed!');
    console.log('\n📊 Summary:');
    console.log('✅ Database connection working');
    console.log('✅ All required tables exist');
    console.log('✅ Basic queries working');
    console.log('✅ Database structure is correct');
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    process.exit(1);
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  testDatabaseConnection().then(() => {
    process.exit(0);
  });
}

module.exports = { testDatabaseConnection };
