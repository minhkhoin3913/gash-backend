const express = require('express');
const router = express.Router();
const Products = require('../models/Products');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Create (Admin/Manager only)
router.post('/', authMiddleware, roleMiddleware(['admin', 'manager']), async (req, res) => {
  try {
    const product = new Products(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Products.find().populate('cat_id', 'cat_name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Products.findById(req.params.id).populate('cat_id', 'cat_name');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update (Admin/Manager only)
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'manager']), async (req, res) => {
  try {
    const product = await Products.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('cat_id', 'cat_name');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete (Admin/Manager only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'manager']), async (req, res) => {
  try {
    const product = await Products.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;