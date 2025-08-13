// backend/src/tests/budget.test.js
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

describe('Budget Endpoints', () => {
  let token;

  beforeAll(async () => {
    // Register and log in a user to get a token
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'budgetuser',
        email: 'budget@example.com',
        password: 'password123',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'budget@example.com',
        password: 'password123',
      });
    token = res.body.token;
  });

  it('should create a new budget for an authenticated user', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Groceries',
        amount: 500,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Groceries');
  });

  it('should get all budgets for an authenticated user', async () => {
    const res = await request(app)
      .get('/api/budgets')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should not allow access to budget routes without a token', async () => {
    const res = await request(app).get('/api/budgets');
    expect(res.statusCode).toEqual(401);
  });
});
