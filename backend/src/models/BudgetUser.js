// backend/src/models/BudgetUser.js
const db = require('../config/database');

const BudgetUser = {
  async addUserToBudget(budgetId, userId, role) {
    const query = `
      INSERT INTO budget_users (budget_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (budget_id, user_id) DO UPDATE SET role = EXCLUDED.role
      RETURNING *;
    `;
    const values = [budgetId, userId, role];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async removeUserFromBudget(budgetId, userId) {
    const query = 'DELETE FROM budget_users WHERE budget_id = $1 AND user_id = $2;';
    const { rowCount } = await db.query(query, [budgetId, userId]);
    return rowCount;
  },

  async findUsersByBudgetId(budgetId) {
    const query = `
      SELECT u.id, u.username, u.email, u.avatar_url, bu.role
      FROM users u
      JOIN budget_users bu ON u.id = bu.user_id
      WHERE bu.budget_id = $1
      ORDER BY bu.role, u.username;
    `;
    const { rows } = await db.query(query, [budgetId]);
    return rows;
  },

  async findUserInBudget(budgetId, userId) {
    const query = 'SELECT * FROM budget_users WHERE budget_id = $1 AND user_id = $2;';
    const { rows } = await db.query(query, [budgetId, userId]);
    return rows[0];
  },

  /**
   * Finds if a user with a given email is already a collaborator on a budget.
   * @param {number} budgetId - The ID of the budget.
   * @param {string} email - The email of the user to check.
   * @returns {Promise<object|null>} The collaboration record or null if not found.
   */
  async findCollaboratorByEmail(budgetId, email) {
    const query = `
      SELECT bu.* FROM budget_users bu
      JOIN users u ON bu.user_id = u.id
      WHERE bu.budget_id = $1 AND u.email = $2;
    `;
    const { rows } = await db.query(query, [budgetId, email]);
    return rows[0];
  }
};

module.exports = BudgetUser;
