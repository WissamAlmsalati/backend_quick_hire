const mongoose = require('mongoose');
const User = require('./userModel');

const FreelancerSchema = new mongoose.Schema({
  skills: { type: [String], required: true },
  rate: { type: Number, required: true },
  portfolio: { type: [String] },  // URLs to portfolio
  bio: { type: String },
  ratings: { type: [Number] },
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  activeProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ActiveProject' }], // Add this line
  oldProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OldProject' }] // Add this line
});

module.exports = User.discriminator('Freelancer', FreelancerSchema);