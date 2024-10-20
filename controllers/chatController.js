const mongoose = require('mongoose');
const Chat = require('../models/chatModel');

exports.getChatMessages = async (req, res) => {
  const { jobId, freelancerId, clientId } = req.params;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(freelancerId) || !mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: 'Invalid job ID, freelancer ID, or client ID' });
  }

  try {
    const messages = await Chat.find({
      jobId,
      $or: [
        { sender: freelancerId, receiver: clientId },
        { sender: clientId, receiver: freelancerId }
      ]
    }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(400).json({ message: 'Error fetching chat messages', error });
  }
};