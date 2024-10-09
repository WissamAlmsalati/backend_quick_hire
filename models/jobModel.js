const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  acceptedFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  canApply: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Job', jobSchema);