const mongoose = require('mongoose');

const ProductImagesSchema = new mongoose.Schema({
  pro_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Products', 
    required: [true, 'Product ID is required'] 
  },
  imageURL: { 
    type: String, 
    required: [true, 'Image URL is required'], 
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: 'Image URL must be a valid URL'
    }
  }
});

module.exports = mongoose.model('ProductImages', ProductImagesSchema);