// backend/src/models/Notification.js
const db = require('../config/database');
const { eq, and, desc } = require('drizzle-orm');
const { notifications } = require('../db/schema');

const Notification = {
  async create({ userId, message, linkUrl }) {
    const [result] = await db.insert(notifications).values({
      user_id: userId,
      message,
      link_url: linkUrl
    }).returning();
    return result;
  },

  async findByUserId(userId) {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at));
  },

  async markAsRead(notificationId, userId) {
    const [result] = await db.update(notifications).set({
      is_read: true
    })
    .where(and(eq(notifications.id, notificationId), eq(notifications.user_id, userId)))
    .returning();
    
    return result || null;
  },

  async markAllAsRead(userId) {
    await db.update(notifications)
      .set({ is_read: true })
      .where(and(eq(notifications.user_id, userId), eq(notifications.is_read, false)));
  }
};

module.exports = Notification;