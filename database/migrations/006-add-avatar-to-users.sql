-- Migration: 005-add-avatar-to-users.sql
-- Description: Adds an avatar_url column to the users table.

BEGIN;

-- Add a column to store the URL of the user's profile picture.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMIT;
