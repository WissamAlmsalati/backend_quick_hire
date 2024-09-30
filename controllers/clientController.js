const User = require('../models/userModel');
const Project = require('../models/projectModel');
const FreelancerProject = require('../models/projectFreelanceModel');
const Job = require('../models/jobModel'); // Import the Job model
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

// Apply for a job
exports.applyForJob = async (req, res) => {
  const { jobId, freelancerId } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.userType !== 'freelancer') {
      return res.status(404).json({ message: 'Freelancer not found or user is not a freelancer' });
    }

    job.applications.push(freelancerId);
    await job.save();

    res.status(200).json({ message: 'Applied for job successfully', job });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(400).json({ message: 'Error applying for job', error });
  }
};

// Accept a freelancer for a job
exports.acceptFreelancerForJob = async (req, res) => {
  const { jobId, freelancerId } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.userType !== 'freelancer') {
      return res.status(404).json({ message: 'Freelancer not found or user is not a freelancer' });
    }

    job.acceptedFreelancer = freelancerId;
    await job.save();

    res.status(200).json({ message: 'Freelancer accepted for job successfully', job });
  } catch (error) {
    console.error('Error accepting freelancer for job:', error);
    res.status(400).json({ message: 'Error accepting freelancer for job', error });
  }
};