const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  skillsRequired: { type: [String], required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;