// backend/src/models/Budget.js
const db = require('../config/database');
const { eq, and, desc, sql } = require('drizzle-orm');
const { budgets, budgetUsers, transactions } = require('../db/schema');

const Budget = {
  async create({ name, amount, category, is_recurring, description, userId }) {
    return await db.transaction(async (tx) => {
      const newBudget = await tx.insert(budgets).values({
        user_id: userId,
        name,
        amount,
        category,
        is_recurring,
        description,
      }).returning();

      await tx.insert(budgetUsers).values({
        budget_id: newBudget[0].id,
        user_id: userId,
        role: 'owner',
      });

      return newBudget[0];
    });
  },

  async findByUserId(userId) {
    const t_stats = db.select({
      budget_id: transactions.budget_id,
      total_spent: sql`SUM(amount)`.as('total_spent'),
      current_month_spent: sql`SUM(CASE WHEN EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW()) THEN amount ELSE 0 END)`.as('current_month_spent'),
    })
    .from(transactions)
    .where(and(eq(transactions.type, 'expense'), eq(transactions.status, 'active')))
    .groupBy(transactions.budget_id)
    .as('t_stats');

    const c_stats = db.select({
      budget_id: budgetUsers.budget_id,
      count: sql`count(*)`.as('count'),
    })
    .from(budgetUsers)
    .groupBy(budgetUsers.budget_id)
    .as('c_stats');

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
      collaborator_count: sql`COALESCE(${c_stats.count}, 0)`.mapWith(Number),
      spent: sql`COALESCE(
        CASE 
          WHEN ${budgets.is_recurring} = true THEN ${t_stats.current_month_spent}
          ELSE ${t_stats.total_spent}
        END, 0.00)`.mapWith(Number),
    })
    .from(budgets)
    .innerJoin(budgetUsers, eq(budgets.id, budgetUsers.budget_id))
    .leftJoin(t_stats, eq(budgets.id, t_stats.budget_id))
    .leftJoin(c_stats, eq(budgets.id, c_stats.budget_id))
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

  async delete(budgetId) {
    const result = await db.delete(budgets)
      .where(eq(budgets.id, budgetId))
      .returning({ deletedId: budgets.id });

    // Return rowCount equivalent (1 if deleted, 0 if not found)
    return result.length;
  },
};

module.exports = Budget;