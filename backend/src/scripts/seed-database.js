// backend/src/scripts/seed-database.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Conditionally set SSL options based on the environment
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false } 
  : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting database seeding...');

    const seedFilePath = path.join(__dirname, '../../../database/seeds/categories.sql');
    
    if (!fs.existsSync(seedFilePath)) {
        throw new Error(`Seed file not found at: ${seedFilePath}`);
    }

    const sql = fs.readFileSync(seedFilePath, 'utf8');
    
    console.log(`- Running seed: categories.sql`);
    await client.query(sql);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
};

seedDatabase();