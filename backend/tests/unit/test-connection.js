const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Probando conexión a MySQL...');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('User:', process.env.DB_USER);
  console.log('Password:', process.env.DB_PASSWORD ? '***' : 'VACÍA');

  try {
    // Primero intentar conectar sin especificar base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('✅ Conexión exitosa a MySQL!');

    // Crear la base de datos si no existe
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Base de datos '${process.env.DB_NAME}' creada/verificada`);

    // Cerrar la conexión inicial
    await connection.end();

    // Crear nueva conexión directamente a la base de datos
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log(`✅ Conectado a la base de datos '${process.env.DB_NAME}'`);

    // Probar una consulta simple
    const [rows] = await dbConnection.execute('SELECT 1 as test');
    console.log('✅ Consulta de prueba exitosa:', rows[0]);

    await dbConnection.end();
    console.log('🎉 ¡Todo configurado correctamente!');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Code:', error.code);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Sugerencias:');
      console.log('1. Verifica que la contraseña en .env sea correcta');
      console.log('2. Prueba con contraseña vacía: DB_PASSWORD=');
      console.log(
        '3. O ejecuta: ALTER USER "root"@"localhost" IDENTIFIED BY "password123";'
      );
    }
  }
}

testConnection();
