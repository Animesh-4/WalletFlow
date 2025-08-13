-- Seed: sample-data.sql
-- Description: Inserts sample data for development and testing.
-- Note: The default data insertion has been commented out to ensure new accounts start empty.

BEGIN;

-- -- [DEACTIVATED] Insert Sample Users
-- -- This section is commented out. New users should be created through the application's registration form.
-- -- The password hashes below are examples and will not work.
--
-- INSERT INTO users (id, username, email, password_hash) VALUES
--     (1, 'Alice', 'alice@example.com', '$2a$10$FB/BO4S.VL2ch2gGRK.c6.2i.fV.XZp.4a.uLi2.p72jV7z.c/aKW'),
--     (2, 'Bob', 'bob@example.com', '$2a$10$FB/BO4S.VL2ch2gGRK.c6.2i.fV.XZp.4a.uLi2.p72jV7z.c/aKW')
-- ON CONFLICT (id) DO NOTHING;


-- -- [DEACTIVATED] Insert Sample Budgets for Alice (user_id = 1)
-- -- This is commented out to ensure new users do not have default budgets.
--
-- INSERT INTO budgets (id, user_id, name, amount) VALUES
--     (1, 1, 'Monthly Groceries', 600.00),
--     (2, 1, 'Transportation', 150.00),
--     (3, 1, 'Entertainment Fund', 200.00)
-- ON CONFLICT (id) DO NOTHING;


-- -- [DEACTIVATED] Insert Sample Transactions for Alice (user_id = 1)
-- -- This is commented out to ensure new users do not have default transactions.
--
-- INSERT INTO transactions (user_id, budget_id, type, amount, description, category_id, date) VALUES
--     (1, NULL, 'income', 3500.00, 'Monthly Salary', 11, '2025-08-01'),
--     (1, 1, 'expense', 125.50, 'Supermarket run', 1, '2025-08-03'),
--     (1, 2, 'expense', 45.00, 'Gasoline', 2, '2025-08-04'),
--     (1, 3, 'expense', 35.00, 'Movie tickets', 5, '2025-08-05'),
--     (1, 1, 'expense', 85.20, 'Weekly groceries', 1, '2025-08-10');


-- Manually update sequences to avoid conflicts if any data was manually inserted before.
-- This ensures that the next user or budget created will get the correct auto-incremented ID.
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('budgets_id_seq', COALESCE((SELECT MAX(id) FROM budgets), 1));
SELECT setval('transactions_id_seq', COALESCE((SELECT MAX(id) FROM transactions), 1));


COMMIT;
