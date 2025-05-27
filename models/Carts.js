const mongoose = require('mongoose');

const CartsSchema = new mongoose.Schema({
  acc_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Accounts', 
    required: [true, 'Account ID is required'] 
  },
    variant_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProductVariants', 
    required: [true, 'Variant ID is required'] 
  },
  pro_quantity: { 
    type: Number, 
    required: [true, 'Product quantity is required'], 
    min: [1, 'Quantity must be at least 1'] 
  },
  pro_price: { 
    type: Number, 
    required: [true, 'Product price is required'], 
    min: [0, 'Price cannot be negative'] 
  },
  Total_price: { 
    type: Number, 
    required: [true, 'Total price is required'], 
    min: [0, 'Total price cannot be negative'],
    validate: {
      validator: function(v) {
        return v === this.pro_quantity * this.pro_price;
      },
      message: 'Total price must equal quantity * price'
    }
  }
});

module.exports = mongoose.model('Carts', CartsSchema);