const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, verifySuperUser } = require('../middleware/auth');

// Route to create a category
router.post('/create', authMiddleware, verifySuperUser, categoryController.createCategory);

// Route to get all categories
router.get('/', categoryController.getAllCategories);

// Route to get category by name
router.get('/:name', categoryController.getCategoryByName);

module.exports = router;