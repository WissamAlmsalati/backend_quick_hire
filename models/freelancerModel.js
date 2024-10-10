const mongoose = require('mongoose');
const User = require('./userModel');

const FreelancerSchema = new mongoose.Schema({
  skills: { type: [String], default: [] }, // Make skills optional with default value
  rate: { type: Number, default: 0 }, // Set default value for rate
  portfolio: { type: [String], default: [] }, // Make portfolio optional with default value
  bio: { type: String, default: '' }, // Make bio optional with default value
  ratings: { type: [Number], default: [] }, // Make ratings optional with default value
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  activeProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ActiveProject' }],
  oldProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OldProject' }],
  wallet: { type: Number, default: 0 } // Add wallet field
});

module.exports = User.discriminator('Freelancer', FreelancerSchema);