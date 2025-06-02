const express = require('express');
const router = express.Router();
const Categories = require('../models/Categories');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Create a new category (Admin/Manager)
router.post('/', authenticateJWT, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    const { cat_name } = req.body;
    if (!cat_name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existingCategory = await Categories.findOne({ cat_name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const category = new Categories({ cat_name });
    const savedCategory = await category.save();
    res.status(201).json({
      message: 'Category created successfully',
      category: savedCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Categories.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories', error: error.message });
  }
});

// Get a single category by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    const category = await Categories.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving category', error: error.message });
  }
});

// Update a category (Admin/Manager)
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    const { cat_name } = req.body;
    if (cat_name) {
      const existingCategory = await Categories.findOne({ cat_name, _id: { $ne: req.params.id } });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }
    const category = await Categories.findByIdAndUpdate(
      req.params.id,
      { cat_name },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// Delete a category (Admin/Manager)
router.delete('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    const category = await Categories.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.log('Access denied or error:', { userId: req.user?.id, role: req.user?.role, error: error.message });
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

module.exports = router;