const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');
const importBillController = require('../controllers/importBillController');

// Search import bills by date range and/or total amount
router.get('/search', authenticateJWT, importBillController.searchImportBills);

// Create a new import bill (Admin/Manager)
router.post('/', authenticateJWT, authorizeRole(['admin', 'manager']), importBillController.createImportBill);

// Get all import bills
router.get('/', authenticateJWT, importBillController.getAllImportBills);

// Get a single import bill by ID
router.get('/:id', authenticateJWT, importBillController.getImportBillById);

// Update an import bill (Admin/Manager)
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), importBillController.updateImportBill);

// Delete an import bill (Admin/Manager)
router.delete('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), importBillController.deleteImportBill);

// Create a new import bill detail (Admin/Manager)
router.post('/details', authenticateJWT, authorizeRole(['admin', 'manager']), importBillController.createImportBillDetail);

// Get all import bill details for a specific bill
router.get('/details/bill/:billId', authenticateJWT, importBillController.getImportBillDetailsByBill);

// Get a single import bill detail by ID
router.get('/details/:id', authenticateJWT, importBillController.getImportBillDetailById);

// Update an import bill detail (Admin/Manager)
router.put('/details/:id', authenticateJWT, authorizeRole(['admin', 'manager']), importBillController.updateImportBillDetail);

// Delete an import bill detail (Admin/Manager)
router.delete('/details/:id', authenticateJWT, authorizeRole(['admin', 'manager']), importBillController.deleteImportBillDetail);

module.exports = router;