const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  skills: { type: [String], required: true },
  location: { type: String, default: 'Remote' },
  clientName: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Add category reference
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  acceptedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  canApply: { type: Boolean, default: true },
  isCompleted: { type: Boolean, default: false }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;