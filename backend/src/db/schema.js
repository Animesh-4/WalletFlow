// backend/src/db/schema.js
const { 
  pgTable, 
  serial, 
  varchar, 
  timestamp, 
  text, 
  numeric, 
  boolean, 
  integer, 
  pgEnum, 
  date,
  primaryKey
} = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

// -----------------------------------------------------------------------------
// CUSTOM TYPES (ENUMS)
// -----------------------------------------------------------------------------
const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);
const budgetRoleEnum = pgEnum('budget_role', ['owner', 'editor', 'viewer']);
const transactionStatusEnum = pgEnum('transaction_status', ['active', 'deleted']);
const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'declined']);

// -----------------------------------------------------------------------------
// TABLE: users (Includes migrations 006 & 008)
// -----------------------------------------------------------------------------
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  password_reset_token: varchar('password_reset_token', { length: 255 }),
  password_reset_expires: timestamp('password_reset_expires', { withTimezone: true }),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// TABLE: categories
// -----------------------------------------------------------------------------
const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).unique().notNull(),
});

// -----------------------------------------------------------------------------
// TABLE: budgets (Includes migrations 003 & 004)
// -----------------------------------------------------------------------------
const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  category: varchar('category', { length: 50 }),
  description: text('description'),
  is_recurring: boolean('is_recurring').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// TABLE: transactions
// -----------------------------------------------------------------------------
const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  budget_id: integer('budget_id').references(() => budgets.id, { onDelete: 'set null' }),
  category_id: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  date: date('date').notNull(),
  status: transactionStatusEnum('status').default('active').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// TABLE: budget_users (Collaboration)
// -----------------------------------------------------------------------------
const budgetUsers = pgTable('budget_users', {
  budget_id: integer('budget_id').notNull().references(() => budgets.id, { onDelete: 'cascade' }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: budgetRoleEnum('role').default('viewer').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.budget_id, t.user_id] }), // Composite Primary Key
}));

// -----------------------------------------------------------------------------
// TABLE: invitations (Includes migration 002)
// -----------------------------------------------------------------------------
const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  budget_id: integer('budget_id').notNull().references(() => budgets.id, { onDelete: 'cascade' }),
  inviter_id: integer('inviter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  invitee_email: varchar('invitee_email', { length: 255 }).notNull(),
  role: budgetRoleEnum('role').notNull(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  status: invitationStatusEnum('status').default('pending').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }),
  // Default to 1 day from now using Drizzle's sql template literal
  expires_at: timestamp('expires_at', { withTimezone: true }).default(sql`NOW() + INTERVAL '1 day'`).notNull(),
});

// -----------------------------------------------------------------------------
// TABLE: budget_history (From migration 005)
// -----------------------------------------------------------------------------
const budgetHistory = pgTable('budget_history', {
  id: serial('id').primaryKey(),
  budget_id: integer('budget_id').notNull().references(() => budgets.id, { onDelete: 'cascade' }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// TABLE: notifications (From migration 007)
// -----------------------------------------------------------------------------
const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  link_url: varchar('link_url', { length: 255 }),
  is_read: boolean('is_read').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// EXPORTS
// -----------------------------------------------------------------------------
module.exports = {
  transactionTypeEnum,
  budgetRoleEnum,
  transactionStatusEnum,
  invitationStatusEnum,
  users,
  categories,
  budgets,
  transactions,
  budgetUsers,
  invitations,
  budgetHistory,
  notifications,
};