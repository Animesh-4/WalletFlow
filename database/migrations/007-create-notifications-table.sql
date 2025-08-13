-- Migration: 006-create-notifications-table.sql
-- Description: Creates a table to store user notifications.

BEGIN;

CREATE SEQUENCE IF NOT EXISTS notifications_id_seq;

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('notifications_id_seq'),
    
    -- Foreign key to the user who will receive the notification
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- The content of the notification message
    message TEXT NOT NULL,
    
    -- A link for the user to click, e.g., to view the budget
    link_url VARCHAR(255),
    
    -- A flag to track if the notification has been read
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add an index for efficiently fetching a user's notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

COMMIT;
