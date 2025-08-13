// backend/src/tests/auth.test.js
const request = require('supertest');
const app = require('../app'); // Assuming your express app is exported from app.js

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should not register a user with an existing email', async () => {
    // First, register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
      });

    // Then, try to register with the same email
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'anotheruser',
        email: 'test2@example.com',
        password: 'password456',
      });
    expect(res.statusCode).toEqual(500); // Or whatever your error status code is
  });

  it('should log in an existing user', async () => {
    // First, register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123',
      });

    // Then, log in
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not log in with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
  });
});
