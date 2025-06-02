const mongoose = require('mongoose');

const ImportBillSchema = new mongoose.Schema({
  create_date: { 
    type: Date, 
    required: [true, 'Creation date is required'] 
  },
  total_amount: { 
    type: Number, 
    required: [true, 'Total amount is required'], 
    min: [0, 'Total amount cannot be negative'] 
  },
  image_bill: { 
    type: String, 
    validate: {
      validator: function(v) {
        return !v || /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: 'Image bill URL must be a valid URL'
    }
  }
});

module.exports = mongoose.model('ImportBill', ImportBillSchema);