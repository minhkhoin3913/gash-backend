const mongoose = require('mongoose');

const ProductColorsSchema = new mongoose.Schema({
  color_name: { 
    type: String, 
    required: [true, 'Color name is required'], 
    maxlength: [30, 'Color name cannot exceed 30 characters'] 
  }
});

module.exports = mongoose.model('ProductColors', ProductColorsSchema);