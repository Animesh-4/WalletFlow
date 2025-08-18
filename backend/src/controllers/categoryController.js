// backend/src/controllers/categoryController.js
const Category = require('../models/Category');

/**
 * Fetches all available categories from the database.
 */
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    // We'll just return an array of the category names for simplicity
    const categoryNames = categories.map(cat => cat.name);
    res.status(200).json(categoryNames);
  } catch (error) {
    next(error);
  }
};
