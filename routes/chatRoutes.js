const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/:jobId/:freelancerId/:clientId', chatController.getChatMessages);

module.exports = router;