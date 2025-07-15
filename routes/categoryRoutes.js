const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

router.post('/', authenticateJWT, authorizeRole(['admin', 'manager']), createCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), updateCategory);
router.delete('/:id', authenticateJWT, authorizeRole(['admin', 'manager']), deleteCategory);

module.exports = router;