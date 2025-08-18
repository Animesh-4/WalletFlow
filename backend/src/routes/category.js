// backend/src/routes/category.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middleware/auth');

// Apply authentication middleware to protect this route
router.use(authenticateToken);

router.get('/', categoryController.getAllCategories);

module.exports = router;
