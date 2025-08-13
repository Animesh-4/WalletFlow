// backend/src/routes/invitation.js
const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const authenticateToken = require('../middleware/auth');

// @route   POST api/invitations/accept
// @desc    Accept a budget collaboration invitation
// @access  Private
router.post('/accept', authenticateToken, invitationController.acceptInvitation);

module.exports = router;
