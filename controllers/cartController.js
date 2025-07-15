// cartController.js
const cartService = require('../services/cartService');
const mongoose = require('mongoose');

// Create a new cart item
exports.createCartItem = async (req, res) => {
  try {
    const { acc_id, variant_id, pro_quantity, pro_price } = req.body;
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'manager' &&
      req.user.id !== acc_id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied: Can only create cart for own account' });
    }
    const savedCartItem = await cartService.createCartItem(req.body);
    res.status(201).json({ message: 'Cart item created successfully', cartItem: savedCartItem });
  } catch (error) {
    res.status(500).json({ message: 'Error creating cart item', error: error.message });
  }
};

// Get all cart items
exports.getAllCartItems = async (req, res) => {
  try {
    const cartItems = await cartService.getAllCartItems(req.user);
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cart items', error: error.message });
  }
};

// Get a single cart item by ID
exports.getCartItemById = async (req, res) => {
  try {
    const cartItem = await cartService.getCartItemById(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'manager' &&
      cartItem.acc_id._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied: Can only view own cart item' });
    }
    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cart item', error: error.message });
  }
};

// Update a cart item
exports.updateCartItem = async (req, res) => {
  try {
    const cartItem = await cartService.getCartItemByIdRaw(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'manager' &&
      cartItem.acc_id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied: Can only update own cart item' });
    }
    const updatedCartItem = await cartService.updateCartItem(req.params.id, req.body, cartItem);
    res.status(200).json({ message: 'Cart item updated successfully', cartItem: updatedCartItem });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

// Delete a cart item
exports.deleteCartItem = async (req, res) => {
  try {
    const cartItem = await cartService.getCartItemByIdRaw(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'manager' &&
      cartItem.acc_id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied: Can only delete own cart item' });
    }
    await cartService.deleteCartItem(req.params.id);
    res.status(200).json({ message: 'Cart item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting cart item', error: error.message });
  }
}; 