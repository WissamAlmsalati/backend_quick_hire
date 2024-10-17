const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const userController = require('../controllers/userController'); // Import the userController
const { verifySuperUser, authMiddleware } = require('../middleware/auth'); // Correctly import authMiddleware

router.post('/create-superuser', clientController.createSuperUser);
router.post('/create-project', clientController.createProject);
router.get('/users', verifySuperUser, clientController.getAllUsers);
router.get('/freelancers', clientController.getFreelancers);
router.get('/clients', clientController.getClients);
router.get('/users/:id', clientController.getUserById);

// New routes for job functionality
router.post('/clients/:clientId/jobs', clientController.createJob);
router.post('/jobs/apply', clientController.applyForJob);
router.post('/jobs/accept', clientController.acceptFreelancerForJob);

router.get('/client/:clientId/jobs', clientController.getJobs);
router.get('/client/:clientId/active-jobs', clientController.getActiveJobs);

// Route to add money to client's wallet
router.post('/add-money', clientController.addMoneyToWallet);

// Route to get user (client or freelancer) by ID
router.get('/user/:id', authMiddleware, userController.getUserById);

// New route to get active projects for a specific client
router.get('/client/:clientId/active-projects', clientController.getActiveProjectsForClient);

module.exports = router;