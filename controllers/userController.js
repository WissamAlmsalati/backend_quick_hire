const mongoose = require('mongoose');
const User = require('../models/userModel');

// Get user information by ID
exports.getUserById = async (req, res) => {
  const { userId } = req.params;

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  // Filter out empty fields
  const filteredUpdates = {};
  for (const key in updates) {
    if (updates[key] !== '' && updates[key] !== null && updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  // Handle rates field
  if (filteredUpdates.rates) {
    filteredUpdates.rates = filteredUpdates.rates.map(rate => ({
      name: rate.name,
      price: rate.price
    }));
  }

  try {
    const user = await User.findByIdAndUpdate(userId, filteredUpdates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};