const User = require('../models/userModel');
const Project = require('../models/projectModel');
const FreelancerProject = require('../models/projectFreelanceModel');
const Job = require('../models/jobModel'); // Import the Job model
const WalletTransaction = require('../models/walletModel'); // Import the WalletTransaction model
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.createProject = async (req, res) => {
  const { clientId, title, description, budget, deadline } = req.body;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: 'Invalid client ID' });
  }

  try {
    const client = await User.findById(clientId);
    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }

    const project = new Project({ title, description, budget, deadline, client: clientId });
    await project.save();

    client.projects.push(project._id);
    await client.save();

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({ message: 'Error creating project', error });
  }
};

// Create a new super user
exports.createSuperUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = new User({ username, email, password, userType: 'superuser', isSuperUser: true });
    await user.save();

    // Generate a token
    const token = user.generateAuthToken();

    res.status(201).json({ message: 'Superuser created successfully', user, token });
  } catch (error) {
    console.error('Error creating superuser:', error); // Log the error details
    res.status(400).json({ message: 'Error creating superuser', error });
  }
};

// Register User
exports.registerUser = async (req, res) => {
  const { username, email, password, userType, projects } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = new User({ username, email, password, userType, projects });
    await user.save();

    // Generate a token
    const token = user.generateAuthToken();

    res.status(201).json({ message: 'User registered successfully', user, token });
  } catch (error) {
    console.error('Error registering user:', error); // Log the error details
    res.status(400).json({ message: 'Error registering user', error });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = user.generateAuthToken();
    res.json({ token, id: user._id });
  } catch (error) {
    console.error('Error logging in user:', error); // Log the error details
    res.status(500).json({ error: 'Server error' });
  }
};



// Add Project to Freelancer
exports.addProject = async (req, res) => {
  const { userId, title, description, photo, review } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.userType !== 'freelancer') {
      return res.status(400).json({ message: 'User is not a freelancer' });
    }

    const project = new FreelancerProject({ freelancer: userId, title, description, photo, review });
    await project.save();

    user.projects.push(project._id);
    await user.save();

    res.status(200).json({ message: 'Project added successfully', project });
  } catch (error) {
    console.error('Error adding project:', error); // Log the error details
    res.status(400).json({ message: 'Error adding project', error });
  }
};

// Get all users (only accessible by super users)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error); // Log the error details
    res.status(400).json({ message: 'Error fetching users', error });
  }
};

// Get all freelancers
exports.getFreelancers = async (req, res) => {
  try {
    const freelancers = await User.find({ userType: 'freelancer' });
    res.status(200).json(freelancers);
  } catch (error) {
    console.error('Error fetching freelancers:', error); // Log the error details
    res.status(400).json({ message: 'Error fetching freelancers', error });
  }
};

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const clients = await User.find({ userType: 'client' });
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error); // Log the error details
    res.status(400).json({ message: 'Error fetching clients', error });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error); // Log the error details
    res.status(400).json({ message: 'Error fetching user', error });
  }
};

// Create a new job
exports.createJob = async (req, res) => {
  const { title, description, budget, deadline, client } = req.body;

  try {
    const job = new Job({ title, description, budget, deadline, client });
    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    console.error('Error creating job:', error); // Log the error details
    res.status(400).json({ message: 'Error creating job', error });
  }
};

// Apply for a job and handle money transaction
exports.applyForJob = async (req, res) => {
  const { jobId, freelancerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(freelancerId)) {
    return res.status(400).json({ message: 'Invalid job ID or freelancer ID' });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const client = await User.findById(job.client);
    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.userType !== 'freelancer') {
      return res.status(404).json({ message: 'Freelancer not found or user is not a freelancer' });
    }

    if (client.wallet < job.budget) {
      return res.status(400).json({ message: 'Client does not have enough money in the wallet' });
    }

    // Deduct money from client's wallet
    client.wallet -= job.budget;
    await client.save();

    // Add money to freelancer's wallet
    freelancer.wallet += job.budget;
    await freelancer.save();

    // Create wallet transactions
    const clientTransaction = new WalletTransaction({
      userId: client._id,
      type: 'withdrawal',
      amount: job.budget,
      description: `Payment for job ${jobId}`
    });
    await clientTransaction.save();

    const freelancerTransaction = new WalletTransaction({
      userId: freelancer._id,
      type: 'deposit',
      amount: job.budget,
      description: `Payment received for job ${jobId}`
    });
    await freelancerTransaction.save();

    // Update job status
    job.freelancer = freelancerId;
    job.status = 'accepted';
    await job.save();

    res.status(200).json({ message: 'Applied for job successfully and payment processed', job });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(400).json({ message: 'Error applying for job', error });
  }
};

// Accept freelancer for job and handle money transaction
exports.acceptFreelancerForJob = async (req, res) => {
  const { jobId, freelancerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(freelancerId)) {
    return res.status(400).json({ message: 'Invalid job ID or freelancer ID' });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.userType !== 'freelancer') {
      return res.status(404).json({ message: 'Freelancer not found or user is not a freelancer' });
    }

    const client = await User.findById(job.client);
    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }

    if (client.wallet < job.budget) {
      return res.status(400).json({ message: 'Insufficient funds in client wallet' });
    }

    // Proceed with the transaction
    console.log(`Client wallet before transaction: ${client.wallet}`);
    console.log(`Freelancer wallet before transaction: ${freelancer.wallet}`);

    client.wallet -= job.budget;
    freelancer.wallet += job.budget;

    await client.save();
    await freelancer.save();

    console.log(`Client wallet after transaction: ${client.wallet}`);
    console.log(`Freelancer wallet after transaction: ${freelancer.wallet}`);

    // Record transactions
    const clientTransaction = new WalletTransaction({
      userId: job.client,
      type: 'transfer',
      amount: -job.budget,
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

    job.acceptedFreelancer = freelancerId;
    job.status = 'accepted';
    await job.save();

    res.status(200).json({ message: 'Freelancer accepted and paid successfully', job });
  } catch (error) {
    console.error('Error accepting freelancer for job:', error);
    res.status(400).json({ message: 'Error accepting freelancer for job', error });
  }
};
// Add money to client's wallet
exports.addMoneyToWallet = async (req, res) => {
  const { clientId, amount } = req.body;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: 'Invalid client ID' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const client = await User.findById(clientId);
    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }

    client.wallet += amount;
    await client.save();

    const transaction = new WalletTransaction({
      userId: clientId,
      type: 'deposit',
      amount,
      description: 'Money added to wallet'
    });
    await transaction.save();

    res.status(200).json({ message: 'Money added to wallet successfully', wallet: client.wallet });
  } catch (error) {
    console.error('Error adding money to wallet:', error);
    res.status(400).json({ message: 'Error adding money to wallet', error });
  }
};



// Get all jobs posted by a specific client
exports.getClientJobs = async (req, res) => {
  const { clientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: 'Invalid client ID' });
  }

  try {
    const client = await User.findById(clientId);
    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }

    const jobs = await Job.find({ client: clientId });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching client jobs:', error);
    res.status(400).json({ message: 'Error fetching client jobs', error });
  }
};