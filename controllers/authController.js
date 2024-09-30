const User = require('../models/userModel');
const Client = require('../models/clientModel');
const Freelancer = require('../models/freelancerModel'); // Import Freelancer model
const SuperUser = require('../models/superUserModel');
const FreelancerProject = require('../models/projectFreelanceModel');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  const { username, email, password, userType, ...rest } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let user;
    if (userType === 'client') {
      user = new Client({ username, email, password, userType, ...rest });
    } else if (userType === 'freelancer') {
      user = new Freelancer({ username, email, password, userType, ...rest });
    } else if (userType === 'superuser') {
      user = new SuperUser({ username, email, password, userType, ...rest });
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    await user.save();
    const token = user.generateAuthToken();
    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error });
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

    const token = jwt.sign({ id: user._id, userType: user.userType }, 'yourSecretKey', { expiresIn: '1h' });
    res.json({ token, id: user._id });
  } catch (error) {
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
    res.status(400).json({ message: 'Error adding project', error });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = user.generateAuthToken();
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Find By
exports.findBy = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({ $text: { $search: query } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error finding users', error });
  }
};