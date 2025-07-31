/**
 * Test de la aplicación principal
 */

const request = require('supertest');

// Mock de variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';
process.env.JWT_SECRET = 'test-secret';
process.env.AWS_REGION = 'eu-north-1';
process.env.AWS_S3_BUCKET = 'test-bucket';
process.env.OPENAI_API_KEY = 'test-openai-key'; // Añadir para evitar error de OpenAI
process.env.PORT = '0'; // Puerto aleatorio para evitar conflictos

describe('App Health Check', () => {
  let app;

  beforeAll(() => {
    // Importar la app después de configurar las variables de entorno
    app = require('../src/app');
  });

  test('should respond to health check', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('environment', 'test');
  });
});
