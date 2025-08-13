// backend/src/controllers/authController.js
const authService = require('../services/authService');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Handles new user registration.
 */
exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const user = await authService.registerUser(username, email, password);
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles user login and ensures the full user object, including avatar_url, is returned.
 */
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await authService.loginUser(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    // Ensure the full user object, including avatar_url, is sent to the frontend.
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        avatar_url: user.avatar_url 
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the full profile of the currently authenticated user, including avatar_url.
 */
exports.getProfile = async (req, res, next) => {
    try {
        const user = await authService.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Ensure the full user object, including avatar_url, is sent to the frontend.
        res.status(200).json({ 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            avatar_url: user.avatar_url 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles the initial "Forgot Password" request.
 */
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const result = await authService.forgotPassword(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Handles the final "Reset Password" action using a token.
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }
    await authService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    next(error);
  }
};
