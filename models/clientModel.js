const mongoose = require('mongoose');
const User = require('./userModel');

const ClientSchema = new mongoose.Schema({
  companyName: { type: String },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  wallet: { type: Number, default: 0 } // Add wallet field
});

module.exports = User.discriminator('Client', ClientSchema);