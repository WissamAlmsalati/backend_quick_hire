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