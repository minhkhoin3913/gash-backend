const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');
const statisticController = require('../controllers/statisticController');

// View Customer Statistics (Admin/Manager only)
router.get('/customers', authenticateJWT, authorizeRole(['admin', 'manager']), statisticController.viewCustomerStats);

// View Revenue Statistics (Admin/Manager only)
router.get('/revenue', authenticateJWT, authorizeRole(['admin', 'manager']), statisticController.viewRevenueStats);

// View Order Statistics (Admin/Manager only)
router.get('/orders', authenticateJWT, authorizeRole(['admin', 'manager']), statisticController.viewOrderStats);

// View Revenue by Week (Admin/Manager only)
router.get('/revenue/week', authenticateJWT, authorizeRole(['admin', 'manager']), statisticController.viewRevenueByWeek);

// View Revenue by Month (Admin/Manager only)
router.get('/revenue/month', authenticateJWT, authorizeRole(['admin', 'manager']), statisticController.viewRevenueByMonth);

// View Revenue by Year (Admin/Manager only)
router.get('/revenue/year', authenticateJWT, authorizeRole(['admin', 'manager']), statisticController.viewRevenueByYear);

module.exports = router;