// backend/src/routes/budget.js
const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authenticateToken = require('../middleware/auth');

// Apply authentication middleware to all routes in this file
router.use(authenticateToken);

// --- Standard Budget CRUD Routes ---
router.get('/', budgetController.getAllBudgets);
router.post('/', budgetController.createBudget);
router.get('/:id', budgetController.getBudgetById);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

// --- Collaboration Routes ---

// @route   POST api/budgets/:id/share
// @desc    Invite a user to collaborate on a budget
// @access  Private (Owner only)
router.post('/:id/share', budgetController.inviteUserToBudget);

// @route   GET api/budgets/:id/collaborators
// @desc    Get all users collaborating on a budget
// @access  Private (Collaborators only)
router.get('/:id/collaborators', budgetController.getBudgetCollaborators);

// @route   DELETE api/budgets/:id/collaborators/:userId
// @desc    Remove a user from a budget
// @access  Private (Owner only)
router.delete('/:id/collaborators/:userId', budgetController.removeUserFromBudget);

router.get('/:id/history', budgetController.getBudgetHistory);
module.exports = router;
