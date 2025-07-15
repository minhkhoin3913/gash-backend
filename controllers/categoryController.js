const categoryService = require('../services/categoryService');

exports.createCategory = async (req, res) => {
  try {
    const savedCategory = await categoryService.createCategoryService(req.body);
    res.status(201).json({
      message: 'Category created successfully',
      category: savedCategory
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating category' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategoriesService();
    res.status(200).json(categories);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving categories' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryByIdService(req.params.id);
    res.status(200).json(category);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategoryService(req.params.id, req.body);
    res.status(200).json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategoryService(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting category' });
  }
}; 