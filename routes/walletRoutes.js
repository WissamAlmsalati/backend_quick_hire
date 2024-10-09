const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

// Route to get wallet balance
router.get('/balance/:userId', walletController.getWalletBalance);

// Route to add funds to wallet
router.post('/add-funds', walletController.addFunds);

// Route to withdraw funds from wallet
router.post('/withdraw-funds', walletController.withdrawFunds);

module.exports = router;