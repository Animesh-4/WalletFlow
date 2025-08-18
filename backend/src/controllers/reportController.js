// backend/src/controllers/reportController.js
const reportService = require('../services/reportService');

exports.getSpendingSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query; // e.g., ?month=8&year=2025
    const summary = await reportService.getSpendingSummaryByCategory(req.user.id, month, year);
    res.status(200).json(summary);
  } catch (error) {
    // This now passes the error to your centralized error handler for a consistent response.
    next(error);
  }
};

exports.getMonthlyReport = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const report = await reportService.getMonthlyFinancialReport(req.user.id, month, year);
        res.status(200).json(report);
    } catch (error) {
        // This now passes the error to your centralized error handler.
        next(error);
    }
};
