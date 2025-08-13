// backend/src/services/budgetService.js
const crypto = require('crypto');
const Budget = require('../models/Budget');
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
    const budget = await Budget.findById(budgetId, userId);
    if (!budget) {
        return null;
    }
    return await Budget.update(budgetId, budgetData, userId);
  },

  async deleteBudget(budgetId, userId) {
    return await Budget.delete(budgetId, userId);
  },

  async inviteUserToBudget({ budgetId, email, role, inviterId }) {
    const budget = await Budget.findById(budgetId, inviterId);
    if (!budget || budget.user_id !== inviterId) {
      const error = new Error('Forbidden: Only the budget owner can invite users.');
      error.statusCode = 403;
      throw error;
    }

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

    // This is the new check to prevent duplicate invitations.
    const existingCollaborator = await BudgetUser.findCollaboratorByEmail(budgetId, email);
    if (existingCollaborator) {
        const error = new Error('This user is already a collaborator on this budget.');
        error.statusCode = 409; // 409 Conflict
        throw error;
    }

    const inviter = await User.findById(inviterId);
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
