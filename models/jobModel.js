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
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  acceptedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  canApply: { type: Boolean, default: true },
  isCompleted: { type: Boolean, default: false }
});

// Static method to get all applications for a specific client ID
jobSchema.statics.getApplicationsByClientId = async function(clientId) {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new Error('Invalid client ID');
  }

  const jobs = await this.find({ client: clientId }).populate('applications');
  if (!jobs) {
    throw new Error('No jobs found for this client');
  }

  const applications = jobs.reduce((acc, job) => {
    return acc.concat(job.applications);
  }, []);

  return applications;
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;