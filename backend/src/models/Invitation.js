// backend/src/models/Invitation.js
const db = require('../config/database');
const { eq, and, gt } = require('drizzle-orm');
const { invitations } = require('../db/schema');

const Invitation = {
  async create({ budgetId, inviterId, inviteeEmail, role, token }) {
    const [result] = await db.insert(invitations).values({
      budget_id: budgetId,
      inviter_id: inviterId,
      invitee_email: inviteeEmail,
      role,
      token,
    }).returning();
    
    return result;
  },

  async findByToken(token) {
    const result = await db.select()
      .from(invitations)
      .where(and(
        eq(invitations.token, token),
        eq(invitations.status, 'pending'),
        gt(invitations.expires_at, new Date())
      ));
    return result[0] || null;
  },

  async findByTokenAllowExpired(token) {
    const result = await db.select().from(invitations).where(eq(invitations.token, token));
    return result[0] || null;
  },

  async updateStatus(id, status) {
    const [result] = await db.update(invitations).set({
      status,
      updated_at: new Date()
    })
    .where(eq(invitations.id, id))
    .returning();
    
    return result;
  },
};

module.exports = Invitation;