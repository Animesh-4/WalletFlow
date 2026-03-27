// backend/src/models/BudgetHistory.js
const db = require('../config/database');
const { eq, desc } = require('drizzle-orm');
const { budgetHistory, users } = require('../db/schema');

const BudgetHistory = {
  async createLog({ budgetId, userId, amount, description }) {
    const [result] = await db.insert(budgetHistory).values({
      budget_id: budgetId,
      user_id: userId,
      amount,
      description
    }).returning();
    return result;
  },

  async findByBudgetId(budgetId) {
    return await db.select({
      id: budgetHistory.id,
      budget_id: budgetHistory.budget_id,
      user_id: budgetHistory.user_id,
      amount: budgetHistory.amount,
      description: budgetHistory.description,
      created_at: budgetHistory.created_at,
      user_username: users.username
    })
    .from(budgetHistory)
    .innerJoin(users, eq(budgetHistory.user_id, users.id))
    .where(eq(budgetHistory.budget_id, budgetId))
    .orderBy(desc(budgetHistory.created_at));
  },
};

module.exports = BudgetHistory;