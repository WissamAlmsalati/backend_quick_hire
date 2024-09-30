const Chat = require('../models/chatModel');

exports.getChatMessages = async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const messages = await Chat.find({ jobId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(400).json({ message: 'Error fetching chat messages', error });
  }
};