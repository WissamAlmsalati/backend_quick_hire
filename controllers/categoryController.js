const Category = require('../models/categoryModel');
const upload = require('../middleware/uploadMiddleware');

exports.createCategory = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { name } = req.body;
    const image = req.file ? req.file.filename : null;

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
      res.status(500).json({ message: 'Error creating category', error: error.message });
    }
  });
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    categories.forEach(category => {
      if (category.image) {
        category.image = `${req.protocol}://${req.get('host')}/uploads/${category.image}`;
      }
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get category by name
exports.getCategoryByName = async (req, res) => {
  const { name } = req.params;

  try {
    const category = await Category.findOne({ name }).lean();
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (category.image) {
      category.image = `${req.protocol}://${req.get('host')}/uploads/${category.image}`;
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};