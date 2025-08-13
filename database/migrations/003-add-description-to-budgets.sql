-- Migration: 003-add-description-to-budgets.sql
-- Description: Adds a description column to the budgets table.

BEGIN;

ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS description TEXT;

COMMIT;
