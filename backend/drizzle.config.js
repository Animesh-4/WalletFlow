/** @type { import("drizzle-kit").Config } */
// Load environment variables for drizzle-kit CLI
require('dotenv').config();

// Validate that DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set.\n' +
    'Check your .env file and ensure it has a valid DATABASE_URL for your development or production database.'
  );
}

module.exports = {
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use DATABASE_URL from environment (validated above)
    // For development: points to dev database
    // For production: points to prod database (via .env.production)
    url: process.env.DATABASE_URL,
  }
};