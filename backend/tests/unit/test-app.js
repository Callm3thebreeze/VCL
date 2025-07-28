require('dotenv').config();
const database = require('../../src/config/database');

async function testApp() {
  console.log('🔧 Probando configuración completa de Vocali...\n');

  try {
    // Probar conexión a base de datos
    console.log('1. 📊 Probando conexión a base de datos...');
    await database.initialize();
    console.log('✅ Base de datos conectada y tablas creadas\n');

    // Verificar variables de entorno críticas
    console.log('2. ⚙️  Verificando configuración...');
    console.log(`   - Puerto: ${process.env.PORT || 3000}`);
    console.log(
      `   - Base de datos: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    );
    console.log(
      `   - JWT Secret: ${
        process.env.JWT_SECRET ? '***configurado***' : '❌ NO CONFIGURADO'
      }`
    );
    console.log('✅ Configuración OK\n');

    // Probar consulta a base de datos
    console.log('3. 🗃️  Probando consulta a base de datos...');
    const result = await database.query(
      'SELECT COUNT(*) as user_count FROM users'
    );
    console.log(`   - Usuarios en BD: ${result[0].user_count}`);
    console.log('✅ Consultas funcionando\n');

    console.log('🎉 ¡Todo configurado correctamente!');
    console.log(
      '📍 Servidor listo para ejecutar en http://localhost:' +
        (process.env.PORT || 3000)
    );
    console.log(
      '📚 Documentación API: http://localhost:' +
        (process.env.PORT || 3000) +
        '/api-docs'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
    console.error('\n🔍 Revisa:');
    console.error(
      '   - Que MySQL en Docker esté ejecutándose: npm run db:start'
    );
    console.error('   - Que las variables de entorno en .env sean correctas');
    console.error('   - Que no haya conflictos de puertos\n');
    process.exit(1);
  }
}

testApp();
