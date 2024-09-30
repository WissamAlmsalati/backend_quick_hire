const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register a new user
router.post('/register', authController.registerUser);

// Login routes
router.post('/login', authController.login);
router.post('/loginUser', authController.loginUser);

// Add Project to Freelancer
router.post('/addProject', authController.addProject);

// Find By route
router.get('/findby', authController.findBy);

module.exports = router;