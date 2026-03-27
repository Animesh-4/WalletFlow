// backend/src/models/BudgetUser.js
const db = require('../config/database');
const { eq, and } = require('drizzle-orm');
const { budgetUsers, users } = require('../db/schema');

const BudgetUser = {
  async addUserToBudget(budgetId, userId, role) {
    const [result] = await db.insert(budgetUsers).values({
      budget_id: budgetId,
      user_id: userId,
      role: role
    })
    .onConflictDoUpdate({
      target: [budgetUsers.budget_id, budgetUsers.user_id],
      set: { role: role }
    })
    .returning();
    
    return result;
  },

  async removeUserFromBudget(budgetId, userId) {
    const result = await db.delete(budgetUsers)
      .where(and(eq(budgetUsers.budget_id, budgetId), eq(budgetUsers.user_id, userId)))
      .returning({ deletedId: budgetUsers.budget_id });
      
    return result.length;
  },

  async findUsersByBudgetId(budgetId) {
    return await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      avatar_url: users.avatar_url,
      role: budgetUsers.role,
    })
    .from(users)
    .innerJoin(budgetUsers, eq(users.id, budgetUsers.user_id))
    .where(eq(budgetUsers.budget_id, budgetId));
  },

  async findUserInBudget(budgetId, userId) {
    const result = await db.select()
      .from(budgetUsers)
      .where(and(eq(budgetUsers.budget_id, budgetId), eq(budgetUsers.user_id, userId)));
    return result[0] || null;
  },

  async findCollaboratorByEmail(budgetId, email) {
    const result = await db.select({
      budget_id: budgetUsers.budget_id,
      user_id: budgetUsers.user_id,
      role: budgetUsers.role,
      created_at: budgetUsers.created_at
    })
    .from(budgetUsers)
    .innerJoin(users, eq(budgetUsers.user_id, users.id))
    .where(and(eq(budgetUsers.budget_id, budgetId), eq(users.email, email)));

    return result[0] || null;
  }
};

module.exports = BudgetUser;