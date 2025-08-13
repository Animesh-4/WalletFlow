-- Migration: 004-add-recurring-to-budgets.sql
-- Description: Adds a column to the budgets table to support recurring budgets.

BEGIN;

-- Add a boolean column to track if a budget should reset monthly.
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;