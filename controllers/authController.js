const User = require('../models/userModel');
const Freelancer = require('../models/freelancerModel');
const Client = require('../models/clientModel');
const SuperUser = require('../models/superUserModel'); // Add this line
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// User registration
exports.register = async (req, res) => {
  const { username, email, password, userType } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let user;
    if (userType === 'client') {
      user = new Client({ username, email, password, userType });
    } else if (userType === 'freelancer') {
      user = new Freelancer({ username, email, password, userType });
    } else if (userType === 'superuser') {
      user = new SuperUser({ username, email, password, userType, permissions: ['all'] }); // Use SuperUser model
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    await user.save();
    const token = user.generateAuthToken();
    res.status(201).json({ token, id: user._id, userType: user.userType });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();
    res.status(200).json({ token, id: user._id, userType: user.userType });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};