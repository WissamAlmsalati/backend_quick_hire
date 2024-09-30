const mongoose = require('mongoose');

const freelancerProjectSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  photo: { type: String },
  review: { type: String }
});

module.exports = mongoose.model('FreelancerProject', freelancerProjectSchema);