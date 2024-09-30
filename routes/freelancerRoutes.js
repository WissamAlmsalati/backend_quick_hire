const express = require('express');
const router = express.Router();
const freelancerController = require('../controllers/freelancerController');

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

module.exports = router;