const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, verifySuperUser } = require('../middleware/auth');

// Route to create a category
router.post('/create', authMiddleware, verifySuperUser, categoryController.createCategory);

module.exports = router;