/**
 * Test básico para verificar que el entorno de testing funciona
 */

describe('Basic Tests', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('environment should be test', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
