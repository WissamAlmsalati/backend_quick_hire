const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController'); // Ensure this path is correct

// Create a new job
router.post('/create', jobController.createJob);

// Apply for a job
router.post('/apply', jobController.applyForJob);

// Accept a job application
router.post('/accept', jobController.acceptApplication);

// Get all jobs
router.get('/all', jobController.getAllJobs); // Ensure getAllJobs is correctly imported

// Get job by ID
router.get('/:id', jobController.getJobById);

// Update job
router.put('/:id', jobController.updateJob);

// Delete job
router.delete('/:id', jobController.deleteJob);

// Deliver job
router.post('/deliver', jobController.deliverJob);

// Get applications for a client's jobs
router.get('/applications/:clientId', jobController.getJobApplications);


router.get('/client/:clientId/jobs',jobController.getJobsByClientId);


router.get('/client/:clientId/applications', jobController.getApplicationsForClient);


router.get('/jobs/:jobId/applications', jobController.getApplicationsByJobId);


router.get('/:jobId/applications', jobController.getJobApplications);


// Get all projects for a specific client
if (jobController.getClientProjects) {
  router.get('/client/:clientId/projects', jobController.getClientProjects);
} else {
  console.error('getClientProjects is not defined in jobController');
}

// Get all projects
if (jobController.getAllProjects) {
  router.get('/projects', jobController.getAllProjects);
} else {
  console.error('getAllProjects is not defined in jobController');
}

// Route to get all categories
router.get('/categories', jobController.getAllCategories);

// Route to get category by name
router.get('/categories/:name', jobController.getCategoryByName);

// Route to get jobs by skill or title
router.get('/search/:search', jobController.getJobsBySkillOrTitle);

module.exports = router;