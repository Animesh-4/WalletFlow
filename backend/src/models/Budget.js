// backend/src/models/Budget.js
const db = require('../config/database');
const { eq, and, desc, sql } = require('drizzle-orm');
const { budgets, budgetUsers } = require('../db/schema');

const Budget = {
  async create({ name, amount, category, is_recurring, description, userId }) {
    // Execute sequentially because the neon-http driver does not support interactive transactions
    const newBudget = await db.insert(budgets).values({
      user_id: userId,
      name,
      amount,
      category,
      is_recurring,
      description,
    }).returning();

    await db.insert(budgetUsers).values({
      budget_id: newBudget[0].id,
      user_id: userId,
      role: 'owner',
    });

    return newBudget[0];
  },

  async findByUserId(userId) {
    // Using Drizzle's sql helper for complex nested aggregations
    const result = await db.select({
      id: budgets.id,
      user_id: budgets.user_id,
      name: budgets.name,
      amount: budgets.amount,
      category: budgets.category,
      is_recurring: budgets.is_recurring,
      description: budgets.description,
      created_at: budgets.created_at,
      role: budgetUsers.role,
      collaborator_count: sql`(SELECT COUNT(*) FROM budget_users bu2 WHERE bu2.budget_id = budgets.id)`.mapWith(Number),
      spent: sql`COALESCE(
        (SELECT SUM(t.amount) FROM transactions t
         WHERE t.budget_id = budgets.id AND t.type = 'expense' AND t.status = 'active'
           AND (budgets.is_recurring = false OR (
                budgets.is_recurring = true AND 
                EXTRACT(MONTH FROM t.date) = EXTRACT(MONTH FROM NOW()) AND
                EXTRACT(YEAR FROM t.date) = EXTRACT(YEAR FROM NOW())
              ))
        ), 0.00)`.mapWith(Number),
    })
    .from(budgets)
    .innerJoin(budgetUsers, eq(budgets.id, budgetUsers.budget_id))
    .where(eq(budgetUsers.user_id, userId))
    .orderBy(desc(budgets.created_at));

    return result;
  },

  async findById(budgetId, userId) {
    const result = await db.select({
      id: budgets.id,
      user_id: budgets.user_id,
      name: budgets.name,
      amount: budgets.amount,
      category: budgets.category,
      is_recurring: budgets.is_recurring,
      description: budgets.description,
      created_at: budgets.created_at,
      role: budgetUsers.role
    })
    .from(budgets)
    .innerJoin(budgetUsers, eq(budgets.id, budgetUsers.budget_id))
    .where(and(eq(budgets.id, budgetId), eq(budgetUsers.user_id, userId)));

    return result[0] || null;
  },

  async update(budgetId, budgetData) {
    const updateData = {};
    const validColumns = ['name', 'amount', 'category', 'is_recurring', 'description'];
    
    Object.keys(budgetData).forEach(key => {
        if (validColumns.includes(key)) {
            updateData[key] = budgetData[key];
        }
    });

    if (Object.keys(updateData).length === 0) {
        throw new Error("No valid fields provided for update.");
    }

    updateData.updated_at = new Date();

    const result = await db.update(budgets)
      .set(updateData)
      .where(eq(budgets.id, budgetId))
      .returning();
      
    return result[0];
  },

  async delete(budgetId, userId) {
    const result = await db.delete(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.user_id, userId)))
      .returning({ deletedId: budgets.id });
      
    // Return rowCount equivalent (1 if deleted, 0 if not found)
    return result.length; 
  },
};

module.exports = Budget;