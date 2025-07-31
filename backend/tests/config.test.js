/**
 * Test simple de configuración - no carga la app completa
 */

describe('Configuration Tests', () => {
  test('should have test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('should load config module without errors', () => {
    // Mock de variables antes de cargar config
    process.env.NODE_ENV = 'test';
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-key';
    process.env.JWT_SECRET = 'test-secret';
    process.env.OPENAI_API_KEY = 'test-openai-key';

    expect(() => {
      const config = require('../src/config/config');
      expect(config).toBeDefined();
    }).not.toThrow();
  });
});
