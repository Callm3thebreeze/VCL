const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  test('GET /health should return 200 OK', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });
});

describe('404 Handler', () => {
  test('Should return 404 for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route').expect(404);

    expect(response.body).toHaveProperty('error', 'Route not found');
    expect(response.body).toHaveProperty('message');
  });
});
