const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  clientName: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  canApply: { type: Boolean, default: true },
  acceptedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skills: [{ type: String, required: true }],
  location: { type: String, required: true, default: 'Remote' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true } // Add category reference
});

module.exports = mongoose.model('Job', jobSchema);