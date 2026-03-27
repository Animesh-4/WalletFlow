// backend/src/models/User.js
const db = require('../config/database');
const { eq, and, gt } = require('drizzle-orm');
const { users } = require('../db/schema');

const User = {
  async create(username, email, hashedPassword) {
    const result = await db.insert(users).values({
      username,
      email,
      password_hash: hashedPassword,
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
    });
    return result[0];
  },

  async findByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  },

  async findById(id) {
    const result = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      created_at: users.created_at,
      avatar_url: users.avatar_url,
    }).from(users).where(eq(users.id, id));
    return result[0] || null;
  },
  
  async update(id, { username, avatar_url }) {
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    updateData.updated_at = new Date(); // Update the timestamp

    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        avatar_url: users.avatar_url,
      });
      
    return result[0];
  },

  async setResetToken(id, token, expires) {
    await db.update(users)
      .set({
        password_reset_token: token,
        password_reset_expires: expires,
        updated_at: new Date(),
      })
      .where(eq(users.id, id));
  },

  async findByResetToken(token) {
    const result = await db.select()
      .from(users)
      .where(
        and(
          eq(users.password_reset_token, token),
          gt(users.password_reset_expires, new Date()) // Token must not be expired
        )
      );
    return result[0] || null;
  },

  async updatePassword(id, hashedPassword) {
    await db.update(users)
      .set({
        password_hash: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
        updated_at: new Date(),
      })
      .where(eq(users.id, id));
  }
};

module.exports = User;