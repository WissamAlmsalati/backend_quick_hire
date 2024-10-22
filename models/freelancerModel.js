const mongoose = require('mongoose');
const User = require('./userModel');

const FreelancerSchema = new mongoose.Schema({
  skills: { type: [String], default: [] },
  rate: { type: Number, default: 0 },
  portfolio: { type: [String], default: [] },
  bio: { type: String, default: '' },
  ratings: { type: [Number], default: [] },
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  activeProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ActiveProject' }],
  oldProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OldProject' }],
  wallet: { type: Number, default: 0 },
  rates: [{ // Added rates field
    name: { type: String, required: true },
    price: { type: Number, required: true }
  }]
});

module.exports = User.discriminator('Freelancer', FreelancerSchema);