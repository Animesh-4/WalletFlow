// backend/src/models/BudgetHistory.js
const db = require('../config/database');

const BudgetHistory = {
  /**
   * Creates a new log entry for a budget adjustment.
   * @param {object} logData - The data for the history log.
   * @returns {Promise<object>} The newly created log entry.
   */
  async createLog({ budgetId, userId, amount, description }) {
    const query = `
      INSERT INTO budget_history (budget_id, user_id, amount, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [budgetId, userId, amount, description];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  /**
   * Finds all history logs for a specific budget.
   * @param {number} budgetId - The ID of the budget.
   * @returns {Promise<Array<object>>} A list of history logs.
   */
  async findByBudgetId(budgetId) {
    const query = `
      SELECT bh.*, u.username as user_username
      FROM budget_history bh
      JOIN users u ON bh.user_id = u.id
      WHERE bh.budget_id = $1
      ORDER BY bh.created_at DESC;
    `;
    const { rows } = await db.query(query, [budgetId]);
    return rows;
  },
};

module.exports = BudgetHistory;
