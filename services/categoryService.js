const Categories = require('../models/Categories');
const mongoose = require('mongoose');

async function createCategoryService({ cat_name }) {
  if (!cat_name) {
    const err = new Error('Category name is required');
    err.status = 400;
    throw err;
  }
  const existingCategory = await Categories.findOne({ cat_name });
  if (existingCategory) {
    const err = new Error('Category name already exists');
    err.status = 400;
    throw err;
  }
  const category = new Categories({ cat_name });
  return await category.save();
}

async function getAllCategoriesService() {
  return await Categories.find();
}

async function getCategoryByIdService(id) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error('Invalid category ID');
    err.status = 400;
    throw err;
  }
  const category = await Categories.findById(id);
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  return category;
}

async function updateCategoryService(id, { cat_name }) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error('Invalid category ID');
    err.status = 400;
    throw err;
  }
  if (cat_name) {
    const existingCategory = await Categories.findOne({ cat_name, _id: { $ne: id } });
    if (existingCategory) {
      const err = new Error('Category name already exists');
      err.status = 400;
      throw err;
    }
  }
  const category = await Categories.findByIdAndUpdate(
    id,
    { cat_name },
    { new: true, runValidators: true }
  );
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  return category;
}

async function deleteCategoryService(id, user) {
  if (!mongoose.isValidObjectId(id)) {
    const err = new Error('Invalid category ID');
    err.status = 400;
    throw err;
  }
  const category = await Categories.findByIdAndDelete(id);
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Category deleted successfully' };
}

module.exports = {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService
}; 