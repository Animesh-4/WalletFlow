// backend/src/services/reportService.js
const db = require('../config/database');

const reportService = {
  async getSpendingSummaryByCategory(userId, month, year) {
    // IMPORTANT: Only include transactions where the status is 'active'
    const query = `
      SELECT 
        c.name as category_name, 
        SUM(t.amount) as total_spent
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE 
        t.user_id = $1 AND
        t.type = 'expense' AND
        t.status = 'active' AND -- This line is crucial
        EXTRACT(MONTH FROM t.date) = $2 AND
        EXTRACT(YEAR FROM t.date) = $3
      GROUP BY c.name
      ORDER BY total_spent DESC;
    `;
    const values = [userId, month, year];
    const { rows } = await db.query(query, values);
    return rows;
  },

  async getMonthlyFinancialReport(userId, month, year) {
    // IMPORTANT: Only include transactions where the status is 'active'
    const query = `
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE type = 'income' AND status = 'active'), 0.00) AS "totalIncome",
        COALESCE(SUM(amount) FILTER (WHERE type = 'expense' AND status = 'active'), 0.00) AS "totalExpenses"
      FROM transactions
      WHERE
        user_id = $1 AND
        EXTRACT(MONTH FROM date) = $2 AND
        EXTRACT(YEAR FROM date) = $3;
    `;
    const values = [userId, month, year];
    const { rows } = await db.query(query, values);
    
    const report = rows[0];
    report.netSavings = report.totalIncome - report.totalExpenses;
    
    const topCategoriesQuery = `
      SELECT 
        c.name as category_name, 
        SUM(t.amount) as amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE 
        t.user_id = $1 AND
        t.type = 'expense' AND
        t.status = 'active' AND -- This line is crucial
        EXTRACT(MONTH FROM t.date) = $2 AND
        EXTRACT(YEAR FROM t.date) = $3
      GROUP BY c.name
      ORDER BY amount DESC
      LIMIT 3;
    `;
    const topCategoriesResult = await db.query(topCategoriesQuery, values);
    
    report.topCategories = topCategoriesResult.rows;
    report.month = new Date(year, month - 1).toISOString();

    return report;
  }
};

module.exports = reportService;
