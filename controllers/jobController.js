const mongoose = require('mongoose');
const Job = require('../models/jobModel');
const User = require('../models/userModel');
const ActiveProject = require('../models/activeProjectSchema');
const OldProject = require('../models/oldProjectModel');
const Rating = require('../models/ratingModel');
const Category = require('../models/categoryModel'); // Add this line
const AppliedJob = require('../models/freelancerApplyModel'); // Import the new model

exports.createJob = async (req, res) => {
  const { clientId, title, description, budget, deadline, skills, location, categoryId } = req.body;

  // Validate clientId and categoryId
  if (!mongoose.Types.ObjectId.isValid(clientId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: 'Invalid client ID or category ID' });
  }

  try {
    const client = await User.findById(clientId);
    const category = await Category.findById(categoryId);

    // Validate client and category existence
    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create new job
    const job = new Job({ 
      title, 
      description, 
      budget, 
      deadline, 
      skills, 
      location: location || 'Remote', 
      clientName: client.username, 
      client: clientId,
      category: categoryId // Link job to category
    });
    await job.save();

    // Associate job with the client
    client.jobs.push(job._id);
    await client.save();

    res.status(201).json({ message: 'Job created successfully', jobId: job._id });
  } catch (error) {
    console.error('Error creating job:', error); // Log the error details
    res.status(400).json({ message: 'Error creating job', error: error.message });
  }
};



exports.applyForJob = async (req, res) => {
  const { jobId, freelancerId } = req.body;

  // Validate jobId and freelancerId
  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(freelancerId)) {
    return res.status(400).json({ message: 'Invalid job ID or freelancer ID' });
  }

  try {
    const job = await Job.findById(jobId);
    
    // Validate job existence and application status
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (!job.canApply) {
      return res.status(400).json({ message: 'Applications are closed for this job' });
    }

    const freelancer = await User.findById(freelancerId);
    
    // Validate freelancer existence and type
    if (!freelancer || freelancer.userType !== 'freelancer') {
      return res.status(404).json({ message: 'Freelancer not found or user is not a freelancer' });
    }

    // Apply for the job
    job.applications.push(freelancerId);
    await job.save();

    // Save the applied job to the new collection
    const appliedJob = new AppliedJob({
      jobId,
      freelancerId,
      status: 'applied'
    });
    await appliedJob.save();

    res.status(200).json({ message: 'Applied for job successfully', jobId: job._id });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(400).json({ message: 'Error applying for job', error });
  }
};


exports.getAllJobs = async (req, res) => {
  try {
    // Filter out jobs that have an accepted freelancer
    const jobs = await Job.find({ acceptedFreelancer: { $exists: false } }).populate({
      path: 'client',
      select: 'username' // Assuming the User model has a 'username' field
    }).lean(); // Use lean() to get plain JavaScript objects

    // Add clientName to each job
    const jobsWithClientName = jobs.map(job => {
      if (job.client && job.client.username) {
        job.clientName = job.client.username;
      }
      return job;
    });

    res.status(200).json(jobsWithClientName);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(400).json({ message: 'Error fetching jobs', error });
  }
};

exports.getJobById = async (req, res) => {
  const { id } = req.params;

  // Validate job ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const job = await Job.findById(id).populate({
      path: 'client',
      select: 'username' // Assuming the User model has a 'username' field
    }).lean(); // Use lean() to get plain JavaScript objects

    // Add clientName to the job
    if (job.client && job.client.username) {
      job.clientName = job.client.username;
    }

    // Validate job existence
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

  // Validate job ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
 const job = await Job.findByIdAndUpdate(id, { title, deadline }, { new: true });
    
    // Validate job existence
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

  // Validate job ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const job = await Job.findByIdAndDelete(id);
    
    // Validate job existence
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Remove job from clients and freelancers
    const client = await User.findById(job.client);
    if (client) {
      client.jobs.pull(job._id);
      await client.save();
    }

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(400).json({ message: 'Error deleting job', error });
  }
};

exports.getActiveProjectById = async (req, res) => {
  const { id } = req.params;

  // Validate project ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }

  try {
    const activeProject = await ActiveProject.findById(id);
    
    // Validate active project existence
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

  // Validate jobId and freelancerId
  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(freelancerId)) {
    return res.status(400).json({ message: 'Invalid job ID or freelancer ID' });
  }

  try {
    const job = await Job.findById(jobId);
    
    // Validate job existence
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.acceptedFreelancer) {
      return res.status(400).json({ message: 'A freelancer has already been accepted for this job' });
    }

    const freelancer = await User.findById(freelancerId);
    
    // Validate freelancer existence and application status
    if (!freelancer || freelancer.userType !== 'freelancer') {
      return res.status(404).json({ message: 'Freelancer not found or user is not a freelancer' });
    }
    if (!job.applications.includes(freelancerId)) {
      return res.status(400).json({ message: 'Freelancer did not apply for this job' });
    }

    // Accept the application
    job.acceptedFreelancer = freelancerId;
    job.applications = [];
    job.canApply = false;

    // Add job to freelancer's list
    freelancer.jobs.push(jobId);

    // Create active project
    const activeProject = new ActiveProject({
      job: jobId,
      freelancer: freelancerId,
      client: job.client
    });
    await activeProject.save();

    // Add active project to freelancer's list
    freelancer.activeProjects.push(activeProject._id);
    await freelancer.save();

    // Add active project to client's list
    const client = await User.findById(job.client);
    client.activeProjects.push(activeProject._id);
    await client.save();

    // Update the applied job status
    await AppliedJob.findOneAndUpdate({ jobId, freelancerId }, { status: 'accepted' });

    await job.save();

    res.status(200).json({ message: 'Application accepted successfully', freelancer });
  } catch (error) {
    console.error('Error accepting application:', error);
    res.status(400).json({ message: 'Error accepting application', error });
  }
};


exports.deliverJob = async (req, res) => {
  const { jobId, rating, review, comment } = req.body;

  // Validate jobId
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const job = await Job.findById(jobId);
    
    // Validate job existence
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const activeProject = await ActiveProject.findOne({ job: jobId });
    
    // Validate active project existence
    if (!activeProject) {
      return res.status(404).json({ message: 'No active project found for this job' });
    }

    // Create rating and review
    const newRating = new Rating({
      job: jobId,
      client: activeProject.client,
      freelancer: activeProject.freelancer,
      rating,
      review,
      comment
    });

    await newRating.save();
    
    // Update job status and close project
    job.isCompleted = true;
    await job.save();
    
    await ActiveProject.findByIdAndDelete(activeProject._id);

    // Update the applied job status
    await AppliedJob.findOneAndUpdate({ jobId, freelancerId: activeProject.freelancer }, { status: 'completed' });

    res.status(200).json({ message: 'Job delivered successfully', newRating });
  } catch (error) {
    console.error('Error delivering job:', error);
    res.status(400).json({ message: 'Error delivering job', error });
  }
};

exports.getJobApplications = async (req, res) => {
  const { jobId } = req.params;

  // Validate jobId
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const applications = await AppliedJob.find({ jobId }).populate('freelancerId', 'username'); // Assuming the User model has a 'username' field
    
    // Validate job existence
    if (!applications.length) {
      return res.status(404).json({ message: 'No applications found for this job' });
    }
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(400).json({ message: 'Error fetching job applications', error });
  }
};

exports.getClientProjects = async (req, res) => {
  const { clientId } = req.params;

  // Validate client ID
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).send('Invalid client ID');
  }

  try {
    const projects = await ActiveProject.find({ client: clientId });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await ActiveProject.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Get category by name
exports.getCategoryByName = async (req, res) => {
  const { name } = req.params;

  try {
    const category = await Category.findOne({ name: name });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error });
  }
};

// Get jobs by skill or title
exports.getJobsBySkillOrTitle = async (req, res) => {
  const { search } = req.params;
  const searchRegex = new RegExp(`^${search}`, 'i'); // Case-insensitive regex for any search term starting with the search string

  try {
    const jobs = await Job.find({
      $or: [
        { skills: searchRegex },
        { title: searchRegex }
      ]
    }).populate({
      path: 'client',
      select: 'username' // Assuming the User model has a 'username' field
    }).lean(); // Use lean() to get plain JavaScript objects

    // Add clientName to each job
    const jobsWithClientName = jobs.map(job => {
      if (job.client && job.client.username) {
        job.clientName = job.client.username;
      }
      return job;
    });

    res.status(200).json(jobsWithClientName);
  } catch (error) {
    console.error('Error fetching jobs by skill or title:', error);
    res.status(400).json({ message: 'Error fetching jobs by skill or title', error });
  }
};




// Get jobs by client ID
exports.getJobsByClientId = async (req, res) => {
  const { clientId } = req.params;

  // Validate client ID
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: 'Invalid client ID' });
  }

  try {
    const client = await User.findById(clientId);

    // Validate client existence
    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }

    const jobs = await Job.find({ client: clientId, canApply: true }).populate({
      path: 'client',
      select: 'username' // Assuming the User model has a 'username' field
    }).lean(); // Use lean() to get plain JavaScript objects

    // Add clientName to each job
    const jobsWithClientName = jobs.map(job => {
      if (job.client && job.client.username) {
        job.clientName = job.client.username;
      }
      return job;
    });

    res.status(200).json(jobsWithClientName);
  } catch (error) {
    console.error('Error fetching jobs by client ID:', error);
    res.status(400).json({ message: 'Error fetching jobs by client ID', error });
  }
};

exports.getJobApplications = async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const job = await Job.findById(jobId).populate('applications');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ applications: job.applications });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(400).json({ message: 'Error fetching job applications', error: error.message });
  }
};




// Get applications for a specific client
exports.getApplicationsForClient = async (req, res) => {
  const { clientId } = req.params;

  // Validate client ID
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ message: 'Invalid client ID' });
  }

  try {
    const client = await User.findById(clientId);

    // Validate client existence
    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }

    const applications = await Job.getApplicationsByClientId(clientId);

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(400).json({ message: 'Error fetching applications', error });
  }
};



exports.getApplicationsByJobId = async (req, res) => {
  const { jobId } = req.params;

  // Validate job ID
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const job = await Job.findById(jobId).populate('applications');

    // Validate job existence
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(job.applications);
  } catch (error) {
    console.error('Error fetching applications for job:', error);
    res.status(400).json({ message: 'Error fetching applications for job', error });
  }
};


exports.getAppliedJobs = async (req, res) => {
  const { freelancerId } = req.params;

  // Validate freelancer ID
  if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
    return res.status(400).json({ message: 'Invalid freelancer ID' });
  }

  try {
    const appliedJobs = await AppliedJob.find({ freelancerId })
      .populate({
        path: 'jobId',
        select: 'title client',
        populate: {
          path: 'client',
          select: 'username'
        }
      });

    // Validate applied jobs existence
    if (!appliedJobs.length) {
      return res.status(404).json({ message: 'No applied jobs found for this freelancer' });
    }

    // Format the response to include job title and client username
    const formattedAppliedJobs = appliedJobs.map(appliedJob => ({
      _id: appliedJob._id,
      jobTitle: appliedJob.jobId.title,
      clientName: appliedJob.jobId.client.username,
      appliedAt: appliedJob.appliedAt,
      status: appliedJob.status
    }));

    res.status(200).json({ appliedJobs: formattedAppliedJobs });
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    res.status(400).json({ message: 'Error fetching applied jobs', error });
  }
};