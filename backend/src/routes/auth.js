// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const authenticateToken = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', validateLogin, authController.login);

// @route   POST api/auth/forgot-password
// @desc    Send a password reset email
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   POST api/auth/reset-password
// @desc    Reset a user's password using a token
// @access  Public
router.post('/reset-password', authController.resetPassword);

// @route   GET api/auth/profile
// @desc    Get the profile of the currently authenticated user
// @access  Private
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
