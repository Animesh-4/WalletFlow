/** @type { import("drizzle-kit").Config } */
// Load environment variables for drizzle-kit CLI
const config = require('./src/config/env');

module.exports = {
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use DATABASE_URL from environment (validated in config/env.js)
    url: config.DATABASE_URL,
  }
};