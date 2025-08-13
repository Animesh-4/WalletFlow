// backend/src/controllers/budgetController.js
const budgetService = require('../services/budgetService');
const BudgetHistory = require('../models/BudgetHistory');

exports.getAllBudgets = async (req, res, next) => {
//   console.log(`[Controller: Budget] Request received for getAllBudgets by user: ${req.user.id}`);
  try {
    const budgets = await budgetService.getBudgetsByUserId(req.user.id);
    res.status(200).json(budgets);
  } catch (error) {
    console.error('[Controller: Budget] Error in getAllBudgets:', error);
    next(error);
  }
};

exports.getBudgetById = async (req, res, next) => {
    // console.log(`[Controller: Budget] Request received for getBudgetById for budget: ${req.params.id} by user: ${req.user.id}`);
    try {
        const { id } = req.params;
        const budget = await budgetService.getBudgetById(id, req.user.id);
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found or access denied' });
        }
        res.status(200).json(budget);
    } catch (error) {
        console.error(`[Controller: Budget] Error in getBudgetById for budget ${req.params.id}:`, error);
        next(error);
    }
};

exports.createBudget = async (req, res, next) => {
  try {
    // FIX: Ensure that 'is_recurring' has a default value of false if it's not provided.
    // This prevents the not-null constraint violation in the database.
    const budgetData = { 
      ...req.body, 
      is_recurring: req.body.is_recurring || false,
      userId: req.user.id 
    };
    const newBudget = await budgetService.createBudget(budgetData);
    res.status(201).json(newBudget);
  } catch (error) {
    next(error);
  }
};

exports.updateBudget = async (req, res, next) => {
    try {
        const { id } = req.params;
        const budgetData = {
            ...req.body,
            is_recurring: req.body.is_recurring || false,
        };
        const budget = await budgetService.updateBudget(id, budgetData, req.user.id);
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found or access denied' });
        }
        res.status(200).json(budget);
    } catch (error) {
        next(error);
    }
};

exports.deleteBudget = async (req, res, next) => {
    console.log(`[Controller: Budget] Request received for deleteBudget on budget: ${req.params.id} by user: ${req.user.id}`);
    try {
        const { id } = req.params;
        const result = await budgetService.deleteBudget(id, req.user.id);
        if (!result) {
            return res.status(404).json({ message: 'Budget not found or access denied' });
        }
        res.status(200).json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error(`[Controller: Budget] Error in deleteBudget for budget ${req.params.id}:`, error);
        next(error);
    }
};

exports.inviteUserToBudget = async (req, res, next) => {
    console.log(`[Controller: Budget] Request received for inviteUserToBudget on budget: ${req.params.id} by user: ${req.user.id}`);
    try {
        const { id: budgetId } = req.params;
        const { email, role } = req.body;
        const inviterId = req.user.id;
        const result = await budgetService.inviteUserToBudget({ budgetId, email, role, inviterId });
        res.status(201).json(result);
    } catch (error) {
        console.error(`[Controller: Budget] Error in inviteUserToBudget for budget ${req.params.id}:`, error);
        next(error);
    }
};

exports.getBudgetCollaborators = async (req, res, next) => {
    console.log(`[Controller: Budget] Request received for getBudgetCollaborators on budget: ${req.params.id} by user: ${req.user.id}`);
    try {
        const { id: budgetId } = req.params;
        const userId = req.user.id;
        const collaborators = await budgetService.getBudgetCollaborators(budgetId, userId);
        res.status(200).json(collaborators);
    } catch (error) {
        console.error(`[Controller: Budget] Error in getBudgetCollaborators for budget ${req.params.id}:`, error);
        next(error);
    }
};

exports.removeUserFromBudget = async (req, res, next) => {
    console.log(`[Controller: Budget] Request received for removeUserFromBudget on budget: ${req.params.id} for user ${req.params.userId} by admin ${req.user.id}`);
    try {
        const { id: budgetId, userId: userIdToRemove } = req.params;
        const removerId = req.user.id;
        await budgetService.removeUserFromBudget({ budgetId, userIdToRemove, removerId });
        res.status(200).json({ message: 'User removed from budget successfully.' });
    } catch (error) {
        console.error(`[Controller: Budget] Error in removeUserFromBudget for budget ${req.params.id}:`, error);
        next(error);
    }
};

exports.getBudgetHistory = async (req, res, next) => {
    try {
        const { id: budgetId } = req.params;
        // You might add a service layer function for this in a larger app
        const history = await BudgetHistory.findByBudgetId(budgetId);
        res.status(200).json(history);
    } catch (error) {
        next(error);
    }
};
