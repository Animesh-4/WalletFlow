-- Seed: categories.sql
-- Description: Populates the categories table with a default set of common financial categories.

-- Use a transaction to ensure all or no data is inserted
BEGIN;

-- Insert a variety of common categories for both expenses and income
-- Using INSERT ... ON CONFLICT DO NOTHING ensures that if you run the seed script
-- multiple times, it won't create duplicate categories or throw an error.
INSERT INTO categories (name) VALUES
    ('Food'),
    ('Transportation'),
    ('Housing'),
    ('Utilities'),
    ('Entertainment'),
    ('Health'),
    ('Shopping'),
    ('Personal Care'),
    ('Education'),
    ('Gifts & Donations'),
    ('Salary'),
    ('Freelance'),
    ('Investment'),
    ('Other')
ON CONFLICT (name) DO NOTHING;

-- Commit the transaction
COMMIT;
