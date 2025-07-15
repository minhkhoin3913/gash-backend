// importBillController.js
const importBillService = require('../services/importBillService');
const mongoose = require('mongoose');

// Validate date string
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Search import bills by date range and/or total amount
exports.searchImportBills = async (req, res) => {
  try {
    const { startDate, endDate, minAmount, maxAmount } = req.query;
    // Validate dates
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ message: 'Invalid start date format' });
    }
    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ message: 'Invalid end date format' });
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        return res.status(400).json({ message: 'Start date cannot be after end date' });
      }
    }
    // Validate amounts
    if (minAmount && (isNaN(minAmount) || Number(minAmount) < 0)) {
      return res.status(400).json({ message: 'Minimum amount must be a non-negative number' });
    }
    if (maxAmount && (isNaN(maxAmount) || Number(maxAmount) < 0)) {
      return res.status(400).json({ message: 'Maximum amount must be a non-negative number' });
    }
    if (minAmount && maxAmount) {
      const min = Number(minAmount);
      const max = Number(maxAmount);
      if (min > max) {
        return res.status(400).json({ message: 'Minimum amount cannot be greater than maximum amount' });
      }
    }
    const importBills = await importBillService.searchImportBills(req.query);
    res.status(200).json(importBills);
  } catch (error) {
    res.status(500).json({ message: 'Error searching import bills', error: error.message });
  }
};

// Create a new import bill
exports.createImportBill = async (req, res) => {
  try {
    const { create_date, total_amount } = req.body;
    if (!create_date || !total_amount) {
      return res.status(400).json({ message: 'Creation date and total amount are required' });
    }
    if (!isValidDate(create_date)) {
      return res.status(400).json({ message: 'Invalid creation date format' });
    }
    if (total_amount <= 0) {
      return res.status(400).json({ message: 'Total amount must be a positive number' });
    }
    const savedBill = await importBillService.createImportBill(req.body);
    res.status(201).json({ message: 'Import bill created successfully', importBill: savedBill });
  } catch (error) {
    res.status(500).json({ message: 'Error creating import bill', error: error.message });
  }
};

// Get all import bills
exports.getAllImportBills = async (req, res) => {
  try {
    const importBills = await importBillService.getAllImportBills();
    res.status(200).json(importBills);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving import bills', error: error.message });
  }
};

// Get a single import bill by ID
exports.getImportBillById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill ID' });
    }
    const importBill = await importBillService.getImportBillById(req.params.id);
    if (!importBill) {
      return res.status(404).json({ message: 'Import bill not found' });
    }
    res.status(200).json(importBill);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving import bill', error: error.message });
  }
};

// Update an import bill
exports.updateImportBill = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill ID' });
    }
    const { create_date, total_amount } = req.body;
    if (!create_date || !total_amount) {
      return res.status(400).json({ message: 'Creation date and total amount are required' });
    }
    if (!isValidDate(create_date)) {
      return res.status(400).json({ message: 'Invalid creation date format' });
    }
    if (typeof total_amount !== 'number' || total_amount <= 0) {
      return res.status(400).json({ message: 'Total amount must be a positive number' });
    }
    const importBill = await importBillService.updateImportBill(req.params.id, req.body);
    if (!importBill) {
      return res.status(404).json({ message: 'Import bill not found' });
    }
    res.status(200).json({ message: 'Import bill updated successfully', importBill });
  } catch (error) {
    res.status(500).json({ message: 'Error updating import bill', error: error.message });
  }
};

// Delete an import bill
exports.deleteImportBill = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill ID' });
    }
    const result = await importBillService.deleteImportBill(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Import bill not found' });
    }
    res.status(200).json({ message: 'Import bill and associated details deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting import bill', error: error.message });
  }
};

// Create a new import bill detail
exports.createImportBillDetail = async (req, res) => {
  try {
    const { bill_id, variant_id, quantity, import_price } = req.body;
    if (!bill_id || !variant_id || !quantity || !import_price) {
      return res.status(400).json({ message: 'Bill ID, variant ID, quantity, and import price are required' });
    }
    if (!mongoose.isValidObjectId(bill_id) || !mongoose.isValidObjectId(variant_id)) {
      return res.status(400).json({ message: 'Invalid bill ID or variant ID' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }
    if (import_price < 0) {
      return res.status(400).json({ message: 'Import price must be a non-negative number' });
    }
    const savedDetail = await importBillService.createImportBillDetail(req.body);
    res.status(201).json({ message: 'Import bill detail created successfully', importBillDetail: savedDetail });
  } catch (error) {
    res.status(500).json({ message: 'Error creating import bill detail', error: error.message });
  }
};

// Get all import bill details for a specific bill
exports.getImportBillDetailsByBill = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.billId)) {
      return res.status(400).json({ message: 'Invalid bill ID' });
    }
    const importBillDetails = await importBillService.getImportBillDetailsByBill(req.params.billId);
    res.status(200).json(importBillDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving import bill details', error: error.message });
  }
};

// Get a single import bill detail by ID
exports.getImportBillDetailById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill detail ID' });
    }
    const importBillDetail = await importBillService.getImportBillDetailById(req.params.id);
    if (!importBillDetail) {
      return res.status(404).json({ message: 'Import bill detail not found' });
    }
    res.status(200).json(importBillDetail);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving import bill detail', error: error.message });
  }
};

// Update an import bill detail
exports.updateImportBillDetail = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill detail ID' });
    }
    const { bill_id, variant_id, quantity, import_price } = req.body;
    if (!bill_id || !variant_id || !quantity || !import_price) {
      return res.status(400).json({ message: 'Bill ID, variant ID, quantity, and import price are required' });
    }
    if (!mongoose.isValidObjectId(bill_id) || !mongoose.isValidObjectId(variant_id)) {
      return res.status(400).json({ message: 'Invalid bill ID or variant ID' });
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }
    if (typeof import_price !== 'number' || import_price < 0) {
      return res.status(400).json({ message: 'Import price must be a non-negative number' });
    }
    const importBillDetail = await importBillService.updateImportBillDetail(req.params.id, req.body);
    if (!importBillDetail) {
      return res.status(404).json({ message: 'Import bill detail not found' });
    }
    res.status(200).json({ message: 'Import bill detail updated successfully', importBillDetail });
  } catch (error) {
    res.status(500).json({ message: 'Error updating import bill detail', error: error.message });
  }
};

// Delete an import bill detail
exports.deleteImportBillDetail = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill detail ID' });
    }
    const result = await importBillService.deleteImportBillDetail(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Import bill detail not found' });
    }
    res.status(200).json({ message: 'Import bill detail deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting import bill detail', error: error.message });
  }
}; 