// backend/src/routes/report.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticateToken = require('../middleware/auth');

// Apply authentication middleware to all routes in this file
router.use(authenticateToken);

// @route   GET api/reports/summary
// @desc    Get spending summary by category for a given period
// @access  Private
router.get('/summary', reportController.getSpendingSummary);

// @route   GET api/reports/monthly
// @desc    Get a full monthly financial report
// @access  Private
router.get('/monthly', reportController.getMonthlyReport);

module.exports = router;
