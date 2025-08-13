// backend/src/models/User.js
const db = require('../config/database');

const User = {
  async create(username, email, hashedPassword) {
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email;
    `;
    const { rows } = await db.query(query, [username, email, hashedPassword]);
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  async findById(id) {
    const query = 'SELECT id, username, email, created_at, avatar_url FROM users WHERE id = $1;';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },
  
  async update(id, { username, avatar_url }) {
    // Build the query dynamically based on the provided fields
    const fields = [];
    const values = [];
    let query = 'UPDATE users SET ';

    if (username) {
        fields.push(`username = $${values.push(username)}`);
    }
    if (avatar_url) {
        fields.push(`avatar_url = $${values.push(avatar_url)}`);
    }

    if (fields.length === 0) {
        // If no fields to update, just return the current user data
        return this.findById(id);
    }

    query += fields.join(', ') + `, updated_at = NOW() WHERE id = $${values.push(id)} RETURNING id, username, email, avatar_url;`;
    
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async setResetToken(id, token, expires) {
    const query = `
      UPDATE users
      SET password_reset_token = $1, password_reset_expires = $2, updated_at = NOW()
      WHERE id = $3;
    `;
    await db.query(query, [token, expires, id]);
  },

  async findByResetToken(token) {
    const query = `
      SELECT * FROM users
      WHERE password_reset_token = $1 AND password_reset_expires > NOW();
    `;
    const { rows } = await db.query(query, [token]);
    return rows[0];
  },

  async updatePassword(id, hashedPassword) {
    const query = `
      UPDATE users
      SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL, updated_at = NOW()
      WHERE id = $2;
    `;
    await db.query(query, [hashedPassword, id]);
  }
};

module.exports = User;
