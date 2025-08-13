// backend/src/controllers/reportController.js
const reportService = require('../services/reportService');

exports.getSpendingSummary = async (req, res) => {
  try {
    const { month, year } = req.query; // e.g., ?month=8&year=2025
    const summary = await reportService.getSpendingSummaryByCategory(req.user.id, month, year);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error generating spending summary', error: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const report = await reportService.getMonthlyFinancialReport(req.user.id, month, year);
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error generating monthly report', error: error.message });
    }
};