const Freelancer = require('../models/freelancerModel');

// Get all freelancers

// Get all freelancers

// Get all freelancers
exports.getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find();
    res.status(200).json(freelancers);
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    res.status(500).json({ message: 'Error fetching freelancers', error });
  }
};

// Get freelancer by ID
exports.getFreelancerById = async (req, res) => {
  const { id } = req.params;

  try {
    const freelancer = await Freelancer.findById(id).populate('projects');
    if (!freelancer ) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    res.status(200).json(freelancer);
  } catch (error) {
    console.error('Error fetching freelancer:', error);
    res.status(500).json({ message: 'Error fetching freelancer', error });
  }
};

// Create a new freelancer
exports.createFreelancer = async (req, res) => {
  const { username, email, password, skills, rate, portfolio, bio, ratings } = req.body;

  try {
    const newFreelancer = new Freelancer({ username, email, password, skills, rate, portfolio, bio, ratings });
    await newFreelancer.save();
    res.status(201).json({ message: 'Freelancer created successfully', freelancer: newFreelancer });
  } catch (error) {
    console.error('Error creating freelancer:', error);
    res.status(500).json({ message: 'Error creating freelancer', error });
  }
};

// Update freelancer
exports.updateFreelancer = async (req, res) => {
  const { id } = req.params;
  const { username, email, skills, rate, portfolio, bio, ratings } = req.body;

  try {
    const freelancer = await Freelancer.findByIdAndUpdate(id, { username, email, skills, rate, portfolio, bio, ratings }, { new: true });
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    res.status(200).json({ message: 'Freelancer updated successfully', freelancer });
  } catch (error) {
    console.error('Error updating freelancer:', error);
    res.status(500).json({ message: 'Error updating freelancer', error });
  }
};

// Delete freelancer
exports.deleteFreelancer = async (req, res) => {
  const { id } = req.params;

  try {
    const freelancer = await Freelancer.findByIdAndDelete(id);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    res.status(200).json({ message: 'Freelancer deleted successfully' });
  } catch (error) {
    console.error('Error deleting freelancer:', error);
    res.status(500).json({ message: 'Error deleting freelancer', error });
  }
};