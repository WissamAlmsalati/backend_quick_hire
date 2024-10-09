const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { verifySuperUser } = require('../middleware/auth');

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

// Route to add money to client's wallet
router.post('/add-money', clientController.addMoneyToWallet);

module.exports = router;