const mongoose = require('mongoose');
const User = require('./userModel');

const SuperUserSchema = new mongoose.Schema({
  permissions: { type: [String], required: true }
});

module.exports = User.discriminator('SuperUser', SuperUserSchema);