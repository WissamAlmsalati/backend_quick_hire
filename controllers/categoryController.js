const Category = require('../models/categoryModel');
const upload = require('../middleware/uploadMiddleware');

exports.createCategory = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name } = req.body;
    const image = req.file ? req.file.path : null;

    if (!name || !image) {
      return res.status(400).json({ message: 'Name and image are required' });
    }

    try {
      // Create new category
      const category = new Category({ name, image });
      await category.save();

      res.status(201).json({ message: 'Category created successfully', categoryId: category._id });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Error creating category', error });
    }
  });
};