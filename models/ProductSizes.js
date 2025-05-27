const mongoose = require('mongoose');

const ProductSizesSchema = new mongoose.Schema({
  size_name: { 
    type: String, 
    required: [true, 'Size name is required'], 
    maxlength: [20, 'Size name cannot exceed 20 characters'] 
  }
});

module.exports = mongoose.model('ProductSizes', ProductSizesSchema);