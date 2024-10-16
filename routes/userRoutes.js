const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// Route to get user (client or freelancer) by ID
router.get('/user/:userId', userController.getUserById);


router.patch('/update-user/:id', authMiddleware, userController.updateUserProfile);


module.exports = router;
