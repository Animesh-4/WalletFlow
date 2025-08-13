// backend/src/models/Category.js
const db = require('../config/database');

const Category = {
  /**
   * Retrieves all available categories from the database.
   * @returns {Promise<Array<object>>} A list of all categories.
   */
  async findAll() {
    const query = 'SELECT * FROM categories ORDER BY name ASC;';
    const { rows } = await db.query(query);
    return rows;
  },

  /**
   * Finds a category by its name.
   * @param {string} name - The name of the category.
   * @returns {Promise<object|null>} The category object or null if not found.
   */
  async findByName(name) {
    const query = 'SELECT * FROM categories WHERE name = $1;';
    const { rows } = await db.query(query, [name]);
    return rows[0];
  },

  /**
   * Finds a category by its name, or creates it if it does not exist.
   * @param {string} name - The name of the category.
   * @returns {Promise<object>} The category object (either found or newly created).
   */
  async findOrCreateByName(name) {
    // First, try to find the category.
    const existingCategory = await this.findByName(name);
    if (existingCategory) {
      return existingCategory;
    }

    // If it doesn't exist, create it.
    const query = `
      INSERT INTO categories (name)
      VALUES ($1)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [name]);
    return rows[0];
  }
};

module.exports = Category;
