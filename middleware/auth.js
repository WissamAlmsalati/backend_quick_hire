const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

const verifySuperUser = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Access denied. No user authenticated.' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user || user.userType !== 'superuser') {
      return res.status(403).json({ message: 'Access denied. Superuser only.' });
    }
    next();
  } catch (error) {
    console.error('Error checking superuser status:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports = { authMiddleware, verifySuperUser };