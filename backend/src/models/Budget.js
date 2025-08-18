// backend/src/models/Budget.js
const db = require('../config/database');

const Budget = {
  async create({ name, amount, category, is_recurring, description, userId }) {
    const query = `
      INSERT INTO budgets (user_id, name, amount, category, is_recurring, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [userId, name, amount, category, is_recurring, description];
    const { rows } = await db.query(query, values);
    await db.query(
        'INSERT INTO budget_users (budget_id, user_id, role) VALUES ($1, $2, $3)',
        [rows[0].id, userId, 'owner']
    );
    return rows[0];
  },

  /**
   * Finds all budgets a user has access to and includes their role for each.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array<object>>} A list of budgets with a 'role' field.
   */
  async findByUserId(userId) {
    const query = `
      SELECT
        b.id, b.user_id, b.name, b.amount, b.category, b.is_recurring, b.description, b.created_at,
        bu.role,
        (SELECT COUNT(*) FROM budget_users bu2 WHERE bu2.budget_id = b.id) AS collaborator_count,
        COALESCE(
          (SELECT SUM(t.amount) FROM transactions t
           WHERE t.budget_id = b.id AND t.type = 'expense' AND t.status = 'active'
             AND (b.is_recurring = false OR (
                  b.is_recurring = true AND 
                  EXTRACT(MONTH FROM t.date) = EXTRACT(MONTH FROM NOW()) AND
                  EXTRACT(YEAR FROM t.date) = EXTRACT(YEAR FROM NOW())
                ))
          ), 0.00) AS spent
      FROM budgets b
      JOIN budget_users bu ON b.id = bu.budget_id
      WHERE bu.user_id = $1
      ORDER BY b.created_at DESC;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  },

  async findById(budgetId, userId) {
    const query = `
      SELECT b.*, bu.role FROM budgets b
      JOIN budget_users bu ON b.id = bu.budget_id
      WHERE b.id = $1 AND bu.user_id = $2;
    `;
    const { rows } = await db.query(query, [budgetId, userId]);
    return rows[0];
  },

  async update(budgetId, budgetData) {
    const fields = [];
    const values = [];
    let query = 'UPDATE budgets SET ';

    Object.keys(budgetData).forEach(key => {
        const validColumns = ['name', 'amount', 'category', 'is_recurring', 'description'];
        if (validColumns.includes(key)) {
            fields.push(`${key} = $${values.length + 1}`);
            values.push(budgetData[key]);
        }
    });

    if (fields.length === 0) {
        throw new Error("No valid fields provided for update.");
    }

    query += fields.join(', ') + `, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *;`;
    values.push(budgetId);
    
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async delete(budgetId, userId) {
    const query = 'DELETE FROM budgets WHERE id = $1 AND user_id = $2;';
    const { rowCount } = await db.query(query, [budgetId, userId]);
    return rowCount;
  },
};

module.exports = Budget;
