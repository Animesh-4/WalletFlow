// backend/src/services/userService.js
const User = require('../models/User');
const { sanitizeObject } = require('../utils/helpers');

const userService = {
  /**
   * Updates a user's profile information.
   * @param {number} userId - The ID of the user to update.
   * @param {object} userData - The user data to update (e.g., { username }).
   * @returns {Promise<object|null>} The updated user object, or null if not found.
   */
  async updateUser(userId, userData) {
    // Business logic can be added here, e.g., checking for username uniqueness
    const updatedUser = await User.update(userId, userData);
    if (updatedUser) {
      // Ensure sensitive data is not returned
      return sanitizeObject(updatedUser, ['password_hash']);
    }
    return null;
  },
};

module.exports = userService;
