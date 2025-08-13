// backend/src/services/notificationService.js
const Notification = require('../models/Notification');
// In the future, you would import your socket handler here to send real-time alerts

const notificationService = {
  /**
   * Creates and sends a new notification.
   * @param {number} userId - The ID of the user to notify.
   * @param {string} message - The notification message.
   * @param {string} [linkUrl] - An optional URL for the notification.
   */
  async createNotification(userId, message, linkUrl = null) {
    console.log(`[Notification Service] Creating notification for user ${userId}: "${message}"`);
    
    // Step 1: Save the notification to the database
    const notification = await Notification.create({ userId, message, linkUrl });

    // Step 2 (Future): Emit a real-time event to the user's client
    // io.to(userId).emit('new_notification', notification);

    return notification;
  },
};

module.exports = notificationService;
