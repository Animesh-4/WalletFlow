// backend/src/tests/transaction.test.js
const request = require('supertest');
const app = require('../app');

describe('Transaction Endpoints', () => {
  let token;
  let budgetId;

  beforeAll(async () => {
    // Register and log in a user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'transactionuser',
        email: 'transaction@example.com',
        password: 'password123',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'transaction@example.com',
        password: 'password123',
      });
    token = loginRes.body.token;

    // Create a budget to associate transactions with
    const budgetRes = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Budget for Transactions',
        amount: 1000,
      });
    budgetId = budgetRes.body.id;
  });

  it('should create a new transaction for an authenticated user', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        budget_id: budgetId,
        type: 'expense',
        amount: 50.75,
        description: 'Dinner',
        date: new Date().toISOString(),
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('description', 'Dinner');
  });

  it('should get all transactions for an authenticated user', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
