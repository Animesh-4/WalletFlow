// backend/src/services/budgetService.js
const crypto = require('crypto');
const Budget = require('../models/Budget');
const BudgetHistory = require('../models/BudgetHistory');
const User = require('../models/User');
const BudgetUser = require('../models/BudgetUser');
const Invitation = require('../models/Invitation');
const emailService = require('./emailService');
const notificationService = require('./notificationService');

const budgetService = {
  async getBudgetsByUserId(userId) {
    return await Budget.findByUserId(userId);
  },

  async getBudgetById(budgetId, userId) {
    return await Budget.findById(budgetId, userId);
  },

  async createBudget(budgetData) {
    return await Budget.create(budgetData);
  },

  async updateBudget(budgetId, budgetData, userId) {
    console.log(`[Service: budgetService] updateBudget called for budget: ${budgetId} by user: ${userId}`);
    
    const userRole = await BudgetUser.findUserInBudget(budgetId, userId);
    if (!userRole) {
        const error = new Error('Forbidden: You do not have access to this budget.');
        error.statusCode = 403;
        throw error;
    }

    const originalBudget = await Budget.findById(budgetId, userId);
    if (!originalBudget) {
        return null;
    }

    if (userRole.role === 'owner') {
        const updatedBudget = await Budget.update(budgetId, budgetData);
        const amountAdded = Number(updatedBudget.amount) - Number(originalBudget.amount);
        if (amountAdded > 0) {
            await BudgetHistory.createLog({
                budgetId,
                userId,
                amount: amountAdded,
                description: "Wow! 🎉 Budget increased.",
            });
        }
        return updatedBudget;

    } else if (userRole.role === 'editor') {
        const newAmount = Number(budgetData.amount);
        const originalAmount = Number(originalBudget.amount);

        const hasInvalidChanges = Object.keys(budgetData).some(key => {
            if (key === 'amount' || key === 'id' || key === 'user_id' || key === 'created_at' || key === 'updated_at' || key === 'spent' || key === 'role' || key === 'collaborator_count') return false;
            return String(budgetData[key]) !== String(originalBudget[key]);
        });

        if (hasInvalidChanges || newAmount <= originalAmount) {
            const error = new Error('Forbidden: Editors can only increase the total budget amount.');
            error.statusCode = 403;
            throw error;
        }

        const updatedBudget = await Budget.update(budgetId, { amount: newAmount });

        await BudgetHistory.createLog({
            budgetId,
            userId,
            amount: newAmount - originalAmount,
            description: "Wow! 🎉 Budget increased.",
        });

        return updatedBudget;

    } else {
        const error = new Error('Forbidden: Viewers cannot modify the budget.');
        error.statusCode = 403;
        throw error;
    }
  },

  async deleteBudget(budgetId, userId) {
    return await Budget.delete(budgetId, userId);
  },

  async inviteUserToBudget({ budgetId, email, role, inviterId }) {
    console.log(`[Service: budgetService] inviteUserToBudget called by user ${inviterId} to invite ${email} to budget ${budgetId}`);
    
    // FIX: The permission check now allows both 'owner' and 'editor' to invite.
    const inviterRole = await BudgetUser.findUserInBudget(budgetId, inviterId);
    if (!inviterRole || (inviterRole.role !== 'owner' && inviterRole.role !== 'editor')) {
      const error = new Error('Forbidden: You do not have permission to invite users to this budget.');
      error.statusCode = 403;
      throw error;
    }

    const budget = await Budget.findById(budgetId, inviterId);
    const inviter = await User.findById(inviterId);
    const userToInvite = await User.findByEmail(email);

    if (!userToInvite) {
      const error = new Error('Not Found: A user with this email address does not exist.');
      error.statusCode = 404;
      throw error;
    }
    
    if (userToInvite.id === inviterId) {
        const error = new Error('Bad Request: You cannot invite yourself to your own budget.');
        error.statusCode = 400;
        throw error;
    }

    const existingCollaborator = await BudgetUser.findCollaboratorByEmail(budgetId, email);
    if (existingCollaborator) {
        const error = new Error('This user is already a collaborator on this budget.');
        error.statusCode = 409;
        throw error;
    }

    const invitationToken = crypto.randomBytes(32).toString('hex');

    await Invitation.create({
      budgetId,
      inviterId,
      inviteeEmail: email,
      role,
      token: invitationToken,
    });

    await emailService.sendBudgetInvitationEmail(email, inviter.username, budget.name, invitationToken);
    await notificationService.createNotification(userToInvite.id, `${inviter.username} has invited you to collaborate on the budget "${budget.name}".`, `/accept-invitation?token=${invitationToken}`);

    return { message: 'Invitation has been sent successfully.' };
  },

  async getBudgetCollaborators(budgetId, userId) {
    const hasAccess = await BudgetUser.findUserInBudget(budgetId, userId);
    if (!hasAccess) {
        const error = new Error('Forbidden: You do not have access to this budget.');
        error.statusCode = 403;
        throw error;
    }
    return await BudgetUser.findUsersByBudgetId(budgetId);
  },

  async removeUserFromBudget({ budgetId, userIdToRemove, removerId }) {
    const budget = await Budget.findById(budgetId, removerId);
    if (!budget || budget.user_id !== removerId) {
      const error = new Error('Forbidden: Only the budget owner can remove users.');
      error.statusCode = 403;
      throw error;
    }
    return await BudgetUser.removeUserFromBudget(budgetId, userIdToRemove);
  },
};

module.exports = budgetService;
