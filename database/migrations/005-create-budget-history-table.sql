-- Migration: 004-create-budget-history-table.sql
-- Description: Creates a table to log adjustments made to budgets.

BEGIN;

CREATE SEQUENCE IF NOT EXISTS budget_history_id_seq;

CREATE TABLE IF NOT EXISTS budget_history (
    id INTEGER PRIMARY KEY NOT NULL DEFAULT nextval('budget_history_id_seq'),
    budget_id INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_history_budget_id ON budget_history(budget_id);

COMMIT;
