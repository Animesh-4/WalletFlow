// backend/src/models/Transaction.js
const db = require('../config/database');

const Transaction = {
  async create({ budget_id, user_id, type, amount, description, category_id, date }) {
    const query = `
      INSERT INTO transactions (budget_id, user_id, type, amount, description, category_id, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [budget_id, user_id, type, amount, description, category_id, date];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async findByUserId(userId) {
    // IMPORTANT: Only select transactions with an 'active' status
    const query = `
      SELECT t.*, c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 AND t.status = 'active'
      ORDER BY t.date DESC, t.created_at DESC;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  },

  async findById(id) {
    const query = `SELECT * FROM transactions WHERE id = $1 AND status = 'active';`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  async update(id, { budget_id, type, amount, description, category_id, date }) {
    const query = `
      UPDATE transactions
      SET budget_id = $1, type = $2, amount = $3, description = $4, category_id = $5, date = $6, updated_at = NOW()
      WHERE id = $7 AND status = 'active'
      RETURNING *;
    `;
    const values = [budget_id, type, amount, description, category_id, date, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  /**
   * Soft deletes a transaction by updating its status to 'deleted'.
   * @param {number} id - The ID of the transaction to delete.
   * @param {number} userId - The ID of the user to ensure ownership.
   * @returns {Promise<number>} The number of rows updated (0 or 1).
   */
  async delete(id, userId) {
    const query = `
      UPDATE transactions
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND status = 'active';
    `;
    const { rowCount } = await db.query(query, [id, userId]);
    return rowCount;
  },

  async findByBudgetId(budgetId) {
    const query = `
      SELECT t.*, c.name as category_name, u.username as user_username
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      JOIN users u ON t.user_id = u.id
      WHERE t.budget_id = $1 AND t.status = 'active'
      ORDER BY t.date DESC, t.created_at DESC;
    `;
    const { rows } = await db.query(query, [budgetId]);
    return rows;
  },
};

module.exports = Transaction;
