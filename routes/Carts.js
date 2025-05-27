const express = require('express');
const router = express.Router();
const Carts = require('../models/Carts');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Create or update cart (Authenticated users only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    const user_id = req.user.id;
    let cart = await Carts.findOne({ user_id });

    if (cart) {
      cart.items = items;
      await cart.save();
    } else {
      cart = new Carts({ user_id, items });
      await cart.save();
    }
    const populatedCart = await Carts.findById(cart._id)
      .populate('user_id', 'username name')
      .populate('items.product_id', 'pro_name imageURL pro_price');
    res.status(201).json(populatedCart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all (Authenticated users see their own carts, admins/managers see all)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let carts;
    if (['admin', 'manager'].includes(req.user.role)) {
      carts = await Carts.find()
        .populate('user_id', 'username name')
        .populate('items.product_id', 'pro_name imageURL pro_price');
    } else {
      carts = await Carts.find({ user_id: req.user.id })
        .populate('user_id', 'username name')
        .populate('items.product_id', 'pro_name imageURL pro_price');
    }
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read one (Authenticated users can see their own carts, admins/managers see all)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const cart = await Carts.findById(req.params.id)
      .populate('user_id', 'username name')
      .populate('items.product_id', 'pro_name imageURL pro_price');
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    if (cart.user_id.toString() !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update (Authenticated users can update their own carts, admins/managers can update all)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const cart = await Carts.findById(req.params.id);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    if (cart.user_id.toString() !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedCart = await Carts.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('user_id', 'username name')
      .populate('items.product_id', 'pro_name imageURL pro_price');
    res.json(updatedCart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete (Authenticated users can delete their own carts, admins/managers can delete all)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const cart = await Carts.findById(req.params.id);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    if (cart.user_id.toString() !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Carts.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cart deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;