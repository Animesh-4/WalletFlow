// backend/src/services/reportService.js
const db = require('../config/database');
const { eq, and, desc, sql } = require('drizzle-orm');
const { transactions, categories } = require('../db/schema');

const reportService = {
  async getSpendingSummaryByCategory(userId, month, year) {
    const result = await db.select({
      category_name: categories.name,
      total_spent: sql`SUM(${transactions.amount})`.mapWith(Number),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.category_id, categories.id))
    .where(and(
      eq(transactions.user_id, userId),
      eq(transactions.type, 'expense'),
      eq(transactions.status, 'active'),
      sql`EXTRACT(MONTH FROM ${transactions.date}) = ${month}`,
      sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`
    ))
    .groupBy(categories.name)
    .orderBy(desc(sql`SUM(${transactions.amount})`));

    return result;
  },

  async getMonthlyFinancialReport(userId, month, year) {
    // 1. Get the Total Income and Expenses
    const [totals] = await db.select({
      totalIncome: sql`COALESCE(SUM(${transactions.amount}) FILTER (WHERE ${transactions.type} = 'income' AND ${transactions.status} = 'active'), 0.00)`.mapWith(Number),
      totalExpenses: sql`COALESCE(SUM(${transactions.amount}) FILTER (WHERE ${transactions.type} = 'expense' AND ${transactions.status} = 'active'), 0.00)`.mapWith(Number),
    })
    .from(transactions)
    .where(and(
      eq(transactions.user_id, userId),
      sql`EXTRACT(MONTH FROM ${transactions.date}) = ${month}`,
      sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`
    ));

    const report = totals || { totalIncome: 0, totalExpenses: 0 };
    report.netSavings = report.totalIncome - report.totalExpenses;
    
    // 2. Get Top 3 Spending Categories
    const topCategories = await db.select({
      category_name: categories.name,
      amount: sql`SUM(${transactions.amount})`.mapWith(Number),
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.category_id, categories.id))
    .where(and(
      eq(transactions.user_id, userId),
      eq(transactions.type, 'expense'),
      eq(transactions.status, 'active'),
      sql`EXTRACT(MONTH FROM ${transactions.date}) = ${month}`,
      sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`
    ))
    .groupBy(categories.name)
    .orderBy(desc(sql`SUM(${transactions.amount})`))
    .limit(3);
    
    report.topCategories = topCategories;
    report.month = new Date(year, month - 1).toISOString();

    return report;
  }
};

module.exports = reportService;