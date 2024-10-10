const Freelancer = require('../models/freelancerModel');
const Job = require('../models/jobModel');
const WalletTransaction = require('../models/walletModel');
const User = require('../models/userModel');

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
    if (!freelancer) {
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

// Freelancer posts a project (job)
exports.postProject = async (req, res) => {
  const { title, description, budget, deadline } = req.body;
  const freelancerId = req.user.id; // Assuming you have user authentication

  try {
    const job = new Job({
      title,
      description,
      budget,
      deadline,
      client: freelancerId, // The freelancer posting the job is the client
    });

    await job.save();
    res.status(201).json({ message: 'Project posted successfully', job });
  } catch (error) {
    console.error('Error posting project:', error);
    res.status(400).json({ message: 'Error posting project', error });
  }
};

// Freelancer applies for a project (job)
exports.applyForJob = async (req, res) => {
  const { jobId } = req.body;
  const freelancerId = req.user.id; // Assuming you have user authentication

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.applications.push(freelancerId);
    await job.save();

    res.status(200).json({ message: 'Applied for job successfully', job });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(400).json({ message: 'Error applying for job', error });
  }
};

// Client accepts a freelancer and pays them
// Client accepts a freelancer and pays them
exports.acceptFreelancerForJob = async (req, res) => {
  const { jobId, freelancerId } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer || freelancer.userType !== 'freelancer') {
      return res.status(404).json({ message: 'Freelancer not found or user is not a freelancer' });
    }

    job.acceptedFreelancer = freelancerId;
    await job.save();

    // Update wallets
    const client = await User.findById(job.client);
    if (client.wallet < job.budget) {
      return res.status(400).json({ message: 'Insufficient funds in client wallet' });
    }

    client.wallet -= job.budget;
    freelancer.wallet += job.budget;
    await client.save();
    await freelancer.save();

    // Record transactions
    const clientTransaction = new WalletTransaction({
      userId: job.client,
      type: 'transfer',
      amount: -job.budg ,
      description: `Payment for job ${jobId}`
    });
    await clientTransaction.save();

    const freelancerTransaction = new WalletTransaction({
      userId: freelancerId,
      type: 'transfer',
      amount: job.budget,
      description: `Payment received for job ${jobId}`
    });
    await freelancerTransaction.save();

    res.status(200).json({ message: 'Freelancer accepted and paid successfully', job });
  } catch (error) {
    console.error('Error accepting freelancer for job:', error);
    res.status(400).json({ message: 'Error accepting freelancer for job', error });
  }
};