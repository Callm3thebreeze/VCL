const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User',
  };

  describe('POST /api/auth/register', () => {
    test('Should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'User registered successfully'
      );
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('Should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('Should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'test2@example.com',
          password: '123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    test('Should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication failed');
    });
  });
});
