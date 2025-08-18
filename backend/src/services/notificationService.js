// backend/src/services/notificationService.js
const Notification = require('../models/Notification');
const { getIO } = require('../socket/socketManager'); 

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
    try {
      const io = getIO();
      const userRoom = `user_${userId}`;
      io.to(userRoom).emit('new_notification', notification);
      console.log(`[Notification Service] Emitted 'new_notification' event to room: ${userRoom}`);
    } catch (error) {
      console.error('[Notification Service] Failed to emit socket event:', error.message);
    }
    return notification;
  },
};

module.exports = notificationService;
