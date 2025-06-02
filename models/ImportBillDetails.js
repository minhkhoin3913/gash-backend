const mongoose = require('mongoose');

const ImportBillDetailsSchema = new mongoose.Schema({
  bill_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ImportBill', 
    required: [true, 'Bill ID is required'] 
  },
    variant_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProductVariants', 
    required: [true, 'Variant ID is required'] 
  },
  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'], 
    min: [1, 'Quantity must be at least 1'] 
  },
    import_price: { 
    type: Number, 
    required: [true, 'Import price is required'], 
    min: [0, 'Import price cannot be negative'] 
  }
});

module.exports = mongoose.model('ImportBillDetails', ImportBillDetailsSchema);