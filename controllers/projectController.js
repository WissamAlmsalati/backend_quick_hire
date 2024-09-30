const Project = require('../models/projectModel');
const User = require('../models/userModel'); // Ensure User model is imported

// Create a new project
exports.createProject = async (req, res) => {
  const { clientId, title, description, budget, deadline } = req.body;

  try {
    // Verify the client exists
    const client = await User.findById(clientId);
    if (!client || client.userType !== 'client') {
      return res.status(404).json({ message: 'Client not found or user is not a client' });
    }

    // Create the project
    const project = new Project({ title, description, budget, deadline, client: clientId });
    await project.save();

    // Add the project to the client's projects array
    client.projects.push(project._id);
    await client.save();

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error); // Log the error details
    res.status(400).json({ message: 'Error creating project', error });
  }
};
// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching projects', error });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching project', error });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Error updating project', error });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting project', error });
  }
};