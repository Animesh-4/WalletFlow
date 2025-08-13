-- Migration: 001-initial-schema.sql
-- Description: Defines the complete initial database schema for the Budget Planner application.
-- This script is idempotent and can be run multiple times without causing errors.

-- Use a transaction to ensure the entire schema is created atomically.
BEGIN;

-- -----------------------------------------------------------------------------
-- SEQUENCES: For auto-incrementing primary keys
-- -----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS users_id_seq;
CREATE SEQUENCE IF NOT EXISTS budgets_id_seq;
CREATE SEQUENCE IF NOT EXISTS transactions_id_seq;
CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS invitations_id_seq;

-- -----------------------------------------------------------------------------
-- CUSTOM TYPES (ENUMS): For data integrity
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income', 'expense');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE budget_role AS ENUM ('owner', 'editor', 'viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('active', 'deleted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- -----------------------------------------------------------------------------
-- TABLE: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('users_id_seq'),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

-- -----------------------------------------------------------------------------
-- TABLE: categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('categories_id_seq'),
    name VARCHAR(50) UNIQUE NOT NULL
);

-- -----------------------------------------------------------------------------
-- TABLE: budgets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('budgets_id_seq'),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);

-- -----------------------------------------------------------------------------
-- TABLE: transactions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('transactions_id_seq'),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_id INTEGER REFERENCES budgets(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status transaction_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_budget_id ON transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- -----------------------------------------------------------------------------
-- TABLE: budget_users (for collaboration)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budget_users (
    budget_id INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role budget_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (budget_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_budget_users_budget_id ON budget_users(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_users_user_id ON budget_users(user_id);

-- -----------------------------------------------------------------------------
-- TABLE: invitations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invitations (
    id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('invitations_id_seq'),
    budget_id INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    inviter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    role budget_role NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status invitation_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '10 minutes'
);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_email ON invitations(invitee_email);

COMMIT;
