const mongoose = require('mongoose');

const ProductVariantsSchema = new mongoose.Schema({
  pro_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Products', 
    required: [true, 'Product ID is required'] 
  },
  color_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProductColors', 
    required: [true, 'Color ID is required'] 
  },
  size_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProductSizes', 
    required: [true, 'Size ID is required'] 
  },
  image_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProductImages', 
    required: [true, 'Image ID is required'] 
  }
});

module.exports = mongoose.model('ProductVariants', ProductVariantsSchema);