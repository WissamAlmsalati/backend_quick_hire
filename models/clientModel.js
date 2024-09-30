const mongoose = require('mongoose');
const User = require('./userModel');

const ClientSchema = new mongoose.Schema({
  companyName: { type: String },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
});

module.exports = User.discriminator('Client', ClientSchema);