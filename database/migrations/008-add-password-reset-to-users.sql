-- Migration: 008-add-password-reset-to-users.sql
-- Description: Adds columns to the users table for secure password resets.

BEGIN;

-- Add columns to store the password reset token and its expiry date
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- Add an index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

COMMIT;
