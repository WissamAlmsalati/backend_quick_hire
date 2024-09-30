const mongoose = require('mongoose');
const Job = require('../models/jobModel');
const User = require('../models/userModel');
const ActiveProject = require('../models/activeProjectSchema');
const OldProject = require('../models/oldProjectModel');
const Rating = require('../models/ratingModel');

exports.createJob = async (req, res) => {
  const { clientId, title, description, budget, deadline } = req.body;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: 'Invalid client ID' });
  }

  try {
    const client = await User.findById(clientId);
    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }

    const job = new Job({ title, description, budget, deadline, client: clientId });
    await job.save();

    client.jobs.push(job._id);
    await client.save();

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ message: 'Error creating job', error });
  }
};

exports.applyForJob = async (req, res) => {
  const { jobId, freelancerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(freelancerId)) {
    return res.status(400).json({ message: 'Invalid job ID or freelancer ID' });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.canApply) {
      return res.status(400).json({ message: 'Applications are closed for this job' });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.userType !== 'freelancer') {
      return res.status(404).json({ message: 'Freelancer not found or user is not a freelancer' });
    }

    job.applications.push(freelancerId);
    await job.save();

    res.status(200).json({ message: 'Applied for job successfully', job });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(400).json({ message: 'Error applying for job', error });
  }
};

exports.getActiveProjectById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  try {
    const activeProject = await ActiveProject.findById(id);
    if (!activeProject) {
      return res.status(404).json({ message: 'Active project not found' });
    }
    res.status(200).json(activeProject);
  } catch (error) {
    console.error('Error fetching active project:', error);
    res.status(400).json({ message: 'Error fetching active project', error });
  }
};

exports.acceptApplication = async (req, res) => {
  const { jobId, freelancerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(freelancerId)) {
    return res.status(400).json({ message: 'Invalid job ID or freelancer ID' });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.acceptedFreelancer) {
      return res.status(400).json({ message: 'A freelancer has already been accepted for this job' });
    }

    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.userType !== 'freelancer') {
      return res.status(404).json({ message: 'Freelancer not found or user is not a freelancer' });
    }

    if (!job.applications.includes(freelancerId)) {
      return res.status(400).json({ message: 'Freelancer did not apply for this job' });
    }

    // Set the accepted freelancer, clear other applications, and set canApply to false
    job.acceptedFreelancer = freelancerId;
    job.applications = [];
    job.canApply = false;

    // Add the job to the freelancer's list of jobs
    freelancer.jobs.push(jobId);

    // Create an active project
    const activeProject = new ActiveProject({
      job: jobId,
      freelancer: freelancerId,
      client: job.client
    });
    await activeProject.save();

    // Add the active project to the freelancer's active projects
    freelancer.activeProjects.push(activeProject._id);
    await freelancer.save();

    await job.save();

    res.status(200).json({ message: 'Application accepted successfully', freelancer });
  } catch (error) {
    console.error('Error accepting application:', error);
    res.status(400).json({ message: 'Error accepting application', error });
  }
};

exports.deliverJob = async (req, res) => {
  const { jobId, rating, review, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const activeProject = await ActiveProject.findOne({ job: jobId });
    if (!activeProject) {
      return res.status(404).json({ message: 'Active project not found' });
    }

    // Move the project from active to old
    const oldProject = new OldProject({
      job: activeProject.job,
      freelancer: activeProject.freelancer,
      client: activeProject.client,
      startDate: activeProject.startDate,
      endDate: new Date()
    });
    await oldProject.save();
    await ActiveProject.findByIdAndDelete(activeProject._id);

    // Remove the active project from the freelancer's active projects
    const freelancer = await User.findById(activeProject.freelancer);
    freelancer.activeProjects.pull(activeProject._id);
    freelancer.oldProjects.push(oldProject._id);
    await freelancer.save();

    // Add a rating and review
    const ratingEntry = new Rating({
      job: jobId,
      freelancer: job.acceptedFreelancer,
      client: job.client,
      rating,
      review,
      comment
    });
    await ratingEntry.save();

    res.status(200).json({ message: 'Job delivered successfully', oldProject, ratingEntry });
  } catch (error) {
    console.error('Error delivering job:', error);
    res.status(400).json({ message: 'Error delivering job', error });
  }
};

exports.getJobApplications = async (req, res) => {
  const { clientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: 'Invalid client ID' });
  }

  try {
    const client = await User.findById(clientId).populate({
      path: 'jobs',
      populate: {
        path: 'applications',
        model: 'User'
      }
    });

    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }

    const jobApplications = client.jobs.map(job => ({
      jobId: job._id,
      title: job.title,
      applications: job.applications.map(freelancer => ({
        freelancerId: freelancer._id,
        username: freelancer.username,
        email: freelancer.email
      }))
    }));

    res.status(200).json({ jobApplications });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(400).json({ message: 'Error fetching job applications', error });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(400).json({ message: 'Error fetching jobs', error });
  }
};

exports.getJobById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(400).json({ message: 'Error fetching job', error });
  }
};

exports.updateJob = async (req, res) => {
  const { id } = req.params;
  const { title, description, budget, deadline } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const job = await Job.findByIdAndUpdate(id, { title, description, budget, deadline }, { new: true });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(400).json({ message: 'Error updating job', error });
  }
};

exports.deleteJob = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(400).json({ message: 'Error deleting job', error });
  }
};