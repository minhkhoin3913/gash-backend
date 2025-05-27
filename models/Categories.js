const mongoose = require('mongoose');

const CategoriesSchema = new mongoose.Schema({
  cat_name: { 
    type: String, 
    required: [true, 'Category name is required'], 
    unique: true, 
    maxlength: [50, 'Category name cannot exceed 50 characters'] 
  }
});

module.exports = mongoose.model('Categories', CategoriesSchema);