const express = require('express');
const router = express.Router();
const ImportBill = require('../models/ImportBill');
const ImportBillDetails = require('../models/ImportBillDetails');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Validate date string
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Search import bills by date range and/or total amount
router.get('/search', authenticateJWT, async (req, res) => {
  try {
    console.log('GET /imports/search called with query:', req.query);
    const { startDate, endDate, minAmount, maxAmount } = req.query;
    const query = {};

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
      query.create_date = { $gte: start, $lte: end };
    } else if (startDate) {
      query.create_date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.create_date = { $lte: new Date(endDate) };
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
      query.total_amount = { $gte: min, $lte: max };
    } else if (minAmount) {
      query.total_amount = { $gte: Number(minAmount) };
    } else if (maxAmount) {
      query.total_amount = { $lte: Number(maxAmount) };
    }

    const importBills = await ImportBill.find(query);
    console.log('Search results:', importBills);
    res.status(200).json(importBills);
  } catch (error) {
    console.error('Error searching import bills:', { query: req.query, error: error.message });
    res.status(500).json({ message: 'Error searching import bills', error: error.message });
  }
});

// Create a new import bill (Admin/Manager)
router.post('/', authenticateJWT, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('POST /imports called with body:', req.body);
    const { create_date, total_amount, image_bill } = req.body;
    
    if (!create_date || !total_amount) {
      return res.status(400).json({ message: 'Creation date and total amount are required' });
    }

    if (!isValidDate(create_date)) {
      return res.status(400).json({ message: 'Invalid creation date format' });
    }

    if (total_amount <= 0) {
      return res.status(400).json({ message: 'Total amount must be a positive number' });
    }

    const importBill = new ImportBill({ create_date, total_amount, image_bill });
    const savedBill = await importBill.save();

    res.status(201).json({
      message: 'Import bill created successfully',
      importBill: savedBill
    });
  } catch (error) {
    console.error('Error creating import bill:', { body: req.body, error: error.message });
    res.status(500).json({ message: 'Error creating import bill', error: error.message });
  }
});

// Get all import bills
router.get('/', authenticateJWT, async (req, res) => {
  try {
    console.log('GET /imports called');
    const importBills = await ImportBill.find();
    res.status(200).json(importBills);
  } catch (error) {
    console.error('Error retrieving import bills:', { error: error.message });
    res.status(500).json({ message: 'Error retrieving import bills', error: error.message });
  }
});

// Get a single import bill by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    console.log('GET /imports/:id called with id:', req.params.id);
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill ID' });
    }
    const importBill = await ImportBill.findById(req.params.id);
    if (!importBill) {
      return res.status(404).json({ message: 'Import bill not found' });
    }
    res.status(200).json(importBill);
  } catch (error) {
    console.error('Error retrieving import bill:', { id: req.params.id, error: error.message });
    res.status(500).json({ message: 'Error retrieving import bill', error: error.message });
  }
});

// Update an import bill (Admin/Manager)
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('PUT /imports/:id called with id:', req.params.id, 'body:', req.body);
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill ID' });
    }
    const { create_date, total_amount, image_bill } = req.body;

    if (!create_date || !total_amount) {
      return res.status(400).json({ message: 'Creation date and total amount are required' });
    }

    if (!isValidDate(create_date)) {
      return res.status(400).json({ message: 'Invalid creation date format' });
    }

    if (typeof total_amount !== 'number' || total_amount <= 0) {
      return res.status(400).json({ message: 'Total amount must be a positive number' });
    }

    const importBill = await ImportBill.findByIdAndUpdate(
      req.params.id,
      { create_date, total_amount, image_bill },
      { new: true, runValidators: true }
    );
    if (!importBill) {
      return res.status(404).json({ message: 'Import bill not found' });
    }

    res.status(200).json({
      message: 'Import bill updated successfully',
      importBill
    });
  } catch (error) {
    console.error('Error updating import bill:', { id: req.params.id, body: req.body, error: error.message });
    res.status(500).json({ message: 'Error updating import bill', error: error.message });
  }
});

// Delete an import bill (Admin/Manager)
router.delete('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('DELETE /imports/:id called with id:', req.params.id);
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill ID' });
    }
    const importBill = await ImportBill.findByIdAndDelete(req.params.id);
    if (!importBill) {
      return res.status(404).json({ message: 'Import bill not found' });
    }
    await ImportBillDetails.deleteMany({ bill_id: req.params.id });
    res.status(200).json({ message: 'Import bill and associated details deleted successfully' });
  } catch (error) {
    console.error('Error deleting import bill:', { id: req.params.id, userId: req.user?.id, role: req.user?.role, error: error.message });
    res.status(500).json({ message: 'Error deleting import bill', error: error.message });
  }
});

// Create a new import bill detail (Admin/Manager)
router.post('/details', authenticateJWT, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('POST /imports/details called with body:', req.body);
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

    const billExists = await ImportBill.findById(bill_id);
    if (!billExists) {
      return res.status(404).json({ message: 'Import bill not found' });
    }

    const importBillDetail = new ImportBillDetails({ bill_id, variant_id, quantity, import_price });
    const savedDetail = await importBillDetail.save();

    res.status(201).json({
      message: 'Import bill detail created successfully',
      importBillDetail: savedDetail
    });
  } catch (error) {
    console.error('Error creating import bill detail:', { body: req.body, error: error.message });
    res.status(500).json({ message: 'Error creating import bill detail', error: error.message });
  }
});

// Get all import bill details for a specific bill
router.get('/details/bill/:billId', authenticateJWT, async (req, res) => {
  try {
    console.log('GET /imports/details/bill/:billId called with billId:', req.params.billId);
    if (!mongoose.isValidObjectId(req.params.billId)) {
      return res.status(400).json({ message: 'Invalid bill ID' });
    }
    const importBillDetails = await ImportBillDetails.find({ bill_id: req.params.billId })
      .populate('variant_id');
    res.status(200).json(importBillDetails);
  } catch (error) {
    console.error('Error retrieving import bill details:', { billId: req.params.billId, error: error.message });
    res.status(500).json({ message: 'Error retrieving import bill details', error: error.message });
  }
});

// Get a single import bill detail by ID
router.get('/details/:id', authenticateJWT, async (req, res) => {
  try {
    console.log('GET /imports/details/:id called with id:', req.params.id);
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill detail ID' });
    }
    const importBillDetail = await ImportBillDetails.findById(req.params.id)
      .populate('variant_id');
    if (!importBillDetail) {
      return res.status(404).json({ message: 'Import bill detail not found' });
    }
    res.status(200).json(importBillDetail);
  } catch (error) {
    console.error('Error retrieving import bill detail:', { id: req.params.id, error: error.message });
    res.status(500).json({ message: 'Error retrieving import bill detail', error: error.message });
  }
});

// Update an import bill detail (Admin/Manager)
router.put('/details/:id', authenticateJWT, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('PUT /imports/details/:id called with id:', req.params.id, 'body:', req.body);
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

    const billExists = await ImportBill.findById(bill_id);
    if (!billExists) {
      return res.status(404).json({ message: 'Import bill not found' });
    }

    const importBillDetail = await ImportBillDetails.findByIdAndUpdate(
      req.params.id,
      { bill_id, variant_id, quantity, import_price },
      { new: true, runValidators: true }
    );
    if (!importBillDetail) {
      return res.status(404).json({ message: 'Import bill detail not found' });
    }

    res.status(200).json({
      message: 'Import bill detail updated successfully',
      importBillDetail
    });
  } catch (error) {
    console.error('Error updating import bill detail:', { id: req.params.id, body: req.body, error: error.message });
    res.status(500).json({ message: 'Error updating import bill detail', error: error.message });
  }
});

// Delete an import bill detail (Admin/Manager)
router.delete('/details/:id', authenticateJWT, authorizeRole(['admin', 'manager']), async (req, res) => {
  try {
    console.log('DELETE /imports/details/:id called with id:', req.params.id);
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid import bill detail ID' });
    }
    const importBillDetail = await ImportBillDetails.findByIdAndDelete(req.params.id);
    if (!importBillDetail) {
      return res.status(404).json({ message: 'Import bill detail not found' });
    }
    res.status(200).json({ message: 'Import bill detail deleted successfully' });
  } catch (error) {
    console.error('Error deleting import bill detail:', { id: req.params.id, error: error.message });
    res.status(500).json({ message: 'Error deleting import bill detail', error: error.message });
  }
});

module.exports = router;