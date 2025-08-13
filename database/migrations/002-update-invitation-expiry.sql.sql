-- Migration: 002-update-invitation-expiry.sql
-- Description: Updates the default expiration time for new invitations to 1 day.

BEGIN;

-- Alter the 'expires_at' column to set a new, longer default value for development.
-- This makes testing the invitation feature much easier.
ALTER TABLE invitations
ALTER COLUMN expires_at SET DEFAULT NOW() + INTERVAL '1 day';

COMMIT;
