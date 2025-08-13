// backend/src/services/invitationService.js
const Invitation = require('../models/Invitation');
const BudgetUser = require('../models/BudgetUser');
const User = require('../models/User');

const invitationService = {
  /**
   * Verifies an invitation token and adds the user to the budget.
   * This function is now robust against being called multiple times.
   * @param {string} token - The invitation token.
   * @param {number} userId - The ID of the user accepting the invitation.
   * @returns {Promise<object>} The budget-user relationship object.
   */
  async acceptInvitation(token, userId) {
    // Step 1: Find the invitation by its token, even if it was just accepted or is expired.
    const invitation = await Invitation.findByTokenAllowExpired(token);

    // Step 2: Perform validation checks.
    if (!invitation) {
      const error = new Error('Not Found: This invitation does not exist.');
      error.statusCode = 404;
      throw error;
    }

    const user = await User.findById(userId);
    if (user.email !== invitation.invitee_email) {
      const error = new Error('Forbidden: This invitation is for a different user.');
      error.statusCode = 403;
      throw error;
    }

    // Step 3: Check the invitation status.
    if (invitation.status === 'accepted') {
      console.log(`[Service: Invitation] Invitation for token ${token} has already been accepted.`);
      return { message: 'Invitation already accepted.' };
    }

    // Check if the invitation is still pending and not expired.
    if (invitation.status !== 'pending' || new Date(invitation.expires_at) < new Date()) {
        const error = new Error('Not Found: This invitation is invalid or has expired.');
        error.statusCode = 404;
        throw error;
    }

    // Step 4: If all checks pass, process the invitation.
    const budgetUser = await BudgetUser.addUserToBudget(invitation.budget_id, userId, invitation.role);
    await Invitation.updateStatus(invitation.id, 'accepted');

    return budgetUser;
  },
};

module.exports = invitationService;
