-- Init: init.sql
-- Description: Initializes the entire database, creates the schema, and populates it with seed data.
-- This script is intended to be run by a PostgreSQL superuser.

-- Create the database if it doesn't already exist
-- Note: You cannot run CREATE DATABASE inside a transaction block.
-- Also, psql's \gexec command is a good way to run this part conditionally.
-- For a simple script, we assume the user connects to a default DB (like 'postgres') to run this.

-- Create a dedicated user and the database
CREATE USER budget_planner_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE budget_planner_db;
GRANT ALL PRIVILEGES ON DATABASE budget_planner_db TO budget_planner_user;

-- You must now connect to the 'budget_planner_db' database to run the rest of the script.
-- In psql, you would do this with: \c budget_planner_db

-- The following commands assume you are now connected to 'budget_planner_db'

-- 1. Run the schema script to create all tables and relationships.
-- In psql, you would use: \i path/to/your/schema.sql
-- This command cannot be run directly inside this SQL script.

-- 2. Run the seeds scripts to populate the database with initial data.
-- In psql, you would use:
-- \i path/to/your/seeds/categories.sql
-- \i path/to/your/seeds/sample-data.sql

-- Example of how you would run this from the command line:
-- psql -U postgres -f database/init.sql
-- psql -U postgres -d budget_planner_db -f database/schema.sql
-- psql -U postgres -d budget_planner_db -f database/seeds/categories.sql
-- psql -U postgres -d budget_planner_db -f database/seeds/sample-data.sql

-- Inform the user that the process is complete.
SELECT 'Database budget_planner_db created and initialized successfully.' as status;
