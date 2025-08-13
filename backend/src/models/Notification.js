// backend/src/models/Notification.js
const db = require('../config/database');

const Notification = {
  async create({ userId, message, linkUrl }) {
    const query = `
      INSERT INTO notifications (user_id, message, link_url)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [userId, message, linkUrl];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async findByUserId(userId) {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC;
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  },

  /**
   * Marks a single notification as read for a specific user.
   */
  async markAsRead(notificationId, userId) {
    const query = `
      UPDATE notifications SET is_read = TRUE 
      WHERE id = $1 AND user_id = $2 RETURNING *;
    `;
    const { rows } = await db.query(query, [notificationId, userId]);
    return rows[0];
  },

  /**
   * Marks all unread notifications as read for a specific user.
   */
  async markAllAsRead(userId) {
      const query = `
        UPDATE notifications SET is_read = TRUE 
        WHERE user_id = $1 AND is_read = FALSE;
      `;
      await db.query(query, [userId]);
  }
};

module.exports = Notification;
