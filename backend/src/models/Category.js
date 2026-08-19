// backend/src/models/Category.js
const db = require('../config/database');
const { eq, asc } = require('drizzle-orm');
const { categories } = require('../db/schema');

const Category = {
  async findAll() {
    return await db.select().from(categories).orderBy(asc(categories.name));
  },

  async findByName(name) {
    const result = await db.select().from(categories).where(eq(categories.name, name));
    return result[0] || null;
  },

  async findOrCreateByName(name) {
    const categoryName = (name || 'Other').trim();
    const existingCategory = await this.findByName(categoryName);
    if (existingCategory) {
      return existingCategory;
    }

    // Drizzle allows us to use `.onConflictDoNothing()` or handle it manually.
    // Since we need the returned object, we'll insert and return.
    const result = await db.insert(categories)
      .values({ name: categoryName })
      .returning();
      
    return result[0];
  }
};

module.exports = Category;