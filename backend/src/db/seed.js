// backend/src/db/seed.js
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');
const { categories } = require('./schema');
const config = require('../config/env');

// Required for neon-serverless to work in Node.js environments
neonConfig.webSocketConstructor = ws;

// Initialize the database connection using validated config
const pool = new Pool({ connectionString: config.DATABASE_URL });
const db = drizzle(pool);

async function seed() {
  // Production safety check: prevent accidental seeding in production
  if (config.isProduction) {
    console.warn('\n⚠️  PRODUCTION ENVIRONMENT DETECTED');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.warn('Seeding production database is potentially dangerous.');
    console.warn('It may reset existing data.');
    console.warn('');
    console.warn('To seed production, run:');
    console.warn('  FORCE_SEED_PRODUCTION=true npm run db:seed');
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (process.env.FORCE_SEED_PRODUCTION !== 'true') {
      console.log('Aborting seed. Use FORCE_SEED_PRODUCTION=true to override.');
      process.exit(1);
    }
    console.log('⚠️  Proceeding with production seed (explicitly enabled)\n');
  }

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