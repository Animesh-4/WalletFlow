// backend/src/models/Transaction.js
const db = require('../config/database');
const { eq, and, desc } = require('drizzle-orm');
const { transactions, categories, users } = require('../db/schema');

const Transaction = {
  async create({ budget_id, user_id, type, amount, description, category_id, date }) {
    const [newTransaction] = await db.insert(transactions).values({
      budget_id,
      user_id,
      type,
      amount,
      description,
      category_id,
      date,
    }).returning({ id: transactions.id });

    // Fetch the newly created transaction with its category name
    const result = await db.select({
      id: transactions.id,
      user_id: transactions.user_id,
      budget_id: transactions.budget_id,
      category_id: transactions.category_id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      status: transactions.status,
      created_at: transactions.created_at,
      updated_at: transactions.updated_at,
      category_name: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.category_id, categories.id))
    .where(eq(transactions.id, newTransaction.id));

    return result[0];
  },

  async findByUserId(userId) {
    return await db.select({
      id: transactions.id,
      user_id: transactions.user_id,
      budget_id: transactions.budget_id,
      category_id: transactions.category_id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      status: transactions.status,
      created_at: transactions.created_at,
      updated_at: transactions.updated_at,
      category_name: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.category_id, categories.id))
    .where(and(eq(transactions.user_id, userId), eq(transactions.status, 'active')))
    .orderBy(desc(transactions.date), desc(transactions.created_at));
  },

  async findById(id) {
    const result = await db.select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.status, 'active')));
    return result[0] || null;
  },

  async update(id, { budget_id, type, amount, description, category_id, date }) {
    await db.update(transactions).set({
      budget_id,
      type,
      amount,
      description,
      category_id,
      date,
      updated_at: new Date()
    })
    .where(and(eq(transactions.id, id), eq(transactions.status, 'active')));

    const result = await db.select({
      id: transactions.id,
      user_id: transactions.user_id,
      budget_id: transactions.budget_id,
      category_id: transactions.category_id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      status: transactions.status,
      created_at: transactions.created_at,
      updated_at: transactions.updated_at,
      category_name: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.category_id, categories.id))
    .where(eq(transactions.id, id));

    return result[0] || null;
  },

  async delete(id, userId) {
    const result = await db.update(transactions).set({
      status: 'deleted',
      updated_at: new Date()
    })
    .where(and(eq(transactions.id, id), eq(transactions.user_id, userId), eq(transactions.status, 'active')))
    .returning({ id: transactions.id });

    return result.length; // 1 if updated, 0 if not found
  },

  async findByBudgetId(budgetId) {
    return await db.select({
      id: transactions.id,
      user_id: transactions.user_id,
      budget_id: transactions.budget_id,
      category_id: transactions.category_id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      status: transactions.status,
      created_at: transactions.created_at,
      updated_at: transactions.updated_at,
      category_name: categories.name,
      user_username: users.username,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.category_id, categories.id))
    .innerJoin(users, eq(transactions.user_id, users.id))
    .where(and(eq(transactions.budget_id, budgetId), eq(transactions.status, 'active')))
    .orderBy(desc(transactions.date), desc(transactions.created_at));
  },
};

module.exports = Transaction;