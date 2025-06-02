const mongoose = require("mongoose");

const WarehousesSchema = new mongoose.Schema({
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariants",
    required: [true, "Variant ID is required"],
  },
  bill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ImportBill",
    required: [true, "Bill ID is required"],
  },
  import_date: {
    type: Date,
    required: [true, "Import date is required"],
  },
  inventory_number: {
    type: Number,
    required: [true, "Inventory number is required"],
    min: [0, "Inventory number cannot be negative"],
  },
});

module.exports = mongoose.model("Warehouses", WarehousesSchema);
