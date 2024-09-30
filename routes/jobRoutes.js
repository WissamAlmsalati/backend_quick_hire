const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Create a new job
router.post('/create', jobController.createJob);

// Apply for a job
router.post('/apply', jobController.applyForJob);

// Accept a job application
router.post('/accept', jobController.acceptApplication);

// Get all jobs
router.get('/', jobController.getAllJobs);

// Get job by ID
router.get('/:id', jobController.getJobById);

// Update job
router.put('/:id', jobController.updateJob);

// Delete job
router.delete('/:id', jobController.deleteJob);


// Accept application
router.post('/accept', jobController.acceptApplication);

// Deliver job
router.post('/deliver', jobController.deliverJob);


// Get applications for a client's jobs
router.get('/applications/:clientId', jobController.getJobApplications); // Add this line

router.post('/deliver', jobController.deliverJob); // Add this line

module.exports = router;