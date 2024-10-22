const mongoose = require('mongoose');

const freelancerApplySchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['preparing', 'active', 'rejected'], default: 'preparing' },
  appliedAt: { type: Date, default: Date.now }
});

const FreelancerApply = mongoose.model('FreelancerApply', freelancerApplySchema);

module.exports = FreelancerApply;