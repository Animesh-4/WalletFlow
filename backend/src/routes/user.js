// backend/src/routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

// Apply authentication middleware to all routes in this file
router.use(authenticateToken);

// @route   PUT api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', userController.updateUser);

module.exports = router;
