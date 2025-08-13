// backend/src/controllers/invitationController.js
const invitationService = require('../services/invitationService');

exports.acceptInvitation = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    console.log(`[Controller: Invitation] Received request to accept invitation.`);
    console.log(`[Controller: Invitation] Token from frontend: ${token}`);

    if (!token) {
        return res.status(400).json({ message: 'Invitation token is required.' });
    }

    const result = await invitationService.acceptInvitation(token, userId);
    res.status(200).json({ message: 'Invitation accepted successfully!', data: result });
  } catch (error) {
    console.error('[Controller: Invitation] Error accepting invitation:', error.message);
    next(error);
  }
};
