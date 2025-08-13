// backend/src/services/authService.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('./emailService');

const authService = {
  /**
   * Registers a new user, checking if the email is already in use.
   */
  async registerUser(username, email, password) {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409; // Conflict
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return await User.create(username, email, hashedPassword);
  },

  /**
   * Logs in a user by verifying their email and password.
   */
  async loginUser(email, password) {
    const user = await User.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return null;
    delete user.password_hash;
    return user;
  },

  /**
   * Finds a user by their ID.
   */
  async findUserById(id) {
    return await User.findById(id);
  },

  /**
   * Handles the forgot password request by generating a secure token,
   * saving it to the database, and sending a reset email.
   */
  async forgotPassword(email) {
    const user = await User.findByEmail(email);
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      // Hash the token before saving it to the database for security
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiryDate = new Date(Date.now() + 3600000); // Token is valid for 1 hour

      await User.setResetToken(user.id, hashedToken, expiryDate);
      
      // Send the unhashed token to the user via email
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    }
    // For security, always return a success message, even if the user doesn't exist.
    return { message: 'If a user with that email exists, a reset link has been sent.' };
  },

  /**
   * Resets a user's password securely by verifying the token.
   */
  async resetPassword(token, newPassword) {
    // Hash the incoming token to match the one stored in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findByResetToken(hashedToken);

    if (!user) {
      const error = new Error('Invalid or expired password reset token.');
      error.statusCode = 400;
      throw error;
    }

    // Hash the new password and update the user's record
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(user.id, hashedPassword);
  }
};

module.exports = authService;
