const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.verifySuperUser = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    const user = await User.findById(decoded.id);

    if (!user || !user.isSuperUser) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};