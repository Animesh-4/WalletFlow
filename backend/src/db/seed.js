// backend/src/db/seed.js
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { categories } = require('./schema');
require('dotenv').config();

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    const defaultCategories = [
      { name: 'Food' },
      { name: 'Transportation' },
      { name: 'Housing' },
      { name: 'Utilities' },
      { name: 'Entertainment' },
      { name: 'Health' },
      { name: 'Shopping' },
      { name: 'Personal Care' },
      { name: 'Education' },
      { name: 'Gifts & Donations' },
      { name: 'Salary' },
      { name: 'Freelance' },
      { name: 'Investment' },
      { name: 'Other' }
    ];

    console.log('Inserting categories...');
    
    // Insert categories and ignore if they already exist (equivalent to ON CONFLICT DO NOTHING)
    await db.insert(categories)
      .values(defaultCategories)
      .onConflictDoNothing({ target: categories.name });

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seed();