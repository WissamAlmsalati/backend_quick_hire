const express = require('express');
const router = express.Router();
const freelancerController = require('../controllers/freelancerController');
const { authMiddleware } = require('../middleware/auth'); // Import the auth middleware

// Get all freelancers
router.get('/', freelancerController.getAllFreelancers);

// Get freelancer by ID
router.get('/:id', freelancerController.getFreelancerById);

// Create a new freelancer
router.post('/', freelancerController.createFreelancer);

// Update freelancer
router.put('/:id', freelancerController.updateFreelancer);

// Delete freelancer
router.delete('/:id', freelancerController.deleteFreelancer);

router.post('/postProject', authMiddleware, freelancerController.postProject);
router.post('/applyForJob', authMiddleware, freelancerController.applyForJob);
router.post('/updateApplicationStatus', authMiddleware, freelancerController.updateApplicationStatus);

module.exports = router;