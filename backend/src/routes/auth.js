// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const authenticateToken = require('../middleware/auth');

router.post('/register', validateRegistration, authController.register);

router.post('/login', validateLogin, authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password', authController.resetPassword);

router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
