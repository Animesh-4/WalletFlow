// backend/src/models/Invitation.js
const db = require('../config/database');

const Invitation = {
  /**
   * Creates a new invitation record in the database.
   * @param {object} invitationData - The data for the invitation.
   * @returns {Promise<object>} The newly created invitation object.
   */
  async create({ budgetId, inviterId, inviteeEmail, role, token }) {
    const query = `
      INSERT INTO invitations (budget_id, inviter_id, invitee_email, role, token)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [budgetId, inviterId, inviteeEmail, role, token];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  /**
   * Finds a PENDING and VALID (not expired) invitation by its unique token.
   * @param {string} token - The invitation token.
   * @returns {Promise<object|null>} The invitation object or null if not found.
   */
  async findByToken(token) {
    const query = `
      SELECT * FROM invitations 
      WHERE token = $1 AND status = 'pending' AND expires_at > NOW();
    `;
    const { rows } = await db.query(query, [token]);
    return rows[0];
  },

  /**
   * Finds an invitation by token, regardless of its status or expiry.
   * This is used to handle cases where an invitation might have just been accepted.
   * @param {string} token - The invitation token.
   * @returns {Promise<object|null>} The invitation object or null if not found.
   */
  async findByTokenAllowExpired(token) {
    const query = `SELECT * FROM invitations WHERE token = $1;`;
    const { rows } = await db.query(query, [token]);
    return rows[0];
  },

  /**
   * Updates the status of an invitation (e.g., to 'accepted').
   * @param {number} id - The ID of the invitation to update.
   * @param {string} status - The new status.
   * @returns {Promise<object>} The updated invitation object.
   */
  async updateStatus(id, status) {
    const query = `
      UPDATE invitations
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;
    const values = [status, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },
};

module.exports = Invitation;
