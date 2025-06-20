const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Orders = require('../models/Orders');
const Accounts = require('../models/Accounts');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Create a new order (User for own order, Admin/Manager)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { acc_id, username, addressReceive, phone, totalPrice, order_status, pay_status, shipping_status, feedback_order } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== acc_id.toString()) {
      console.log('Access denied:', { userId: req.user.id, requestedAccId: acc_id });
      return res.status(403).json({ message: 'Access denied: Can only create order for own account' });
    }

    const account = await Accounts.findById(acc_id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const order = new Orders({
      acc_id,
      addressReceive,
      phone,
      totalPrice,
      order_status: order_status || 'pending',
      pay_status: pay_status || 'unpaid',
      shipping_status: shipping_status || 'not_shipped',
      feedback_order: feedback_order || 'None'
    });

    const savedOrder = await order.save();
    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Get all orders (Admin/Manager or own orders for User)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      orders = await Orders.find().populate('acc_id', 'username name');
    } else {
      orders = await Orders.find({ acc_id: req.user.id }).populate('acc_id', 'username name');
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get orders error:', error.message);
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
});

// Search orders (Admin/Manager or own orders for User)
router.get('/search', authenticateJWT, async (req, res) => {
  try {
    const { q, acc_id } = req.query;
    let query = {};
    
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      query.acc_id = req.user.id;
    } else if (acc_id) {
      if (!mongoose.isValidObjectId(acc_id)) {
        return res.status(400).json({ message: 'Invalid account ID' });
      }
      query.acc_id = acc_id;
    }

    if (q && typeof q === 'string' && q.trim() !== '') {
      const trimmedQuery = q.trim();
      query.$or = [
        { order_status: { $regex: trimmedQuery, $options: 'i' } },
        { pay_status: { $regex: trimmedQuery, $options: 'i' } },
        { shipping_status: { $regex: trimmedQuery, $options: 'i' } }
      ];

      // Check if query is a valid ObjectId for _id search
      if (mongoose.isValidObjectId(trimmedQuery)) {
        query.$or.push({ _id: new mongoose.Types.ObjectId(trimmedQuery) });
      }

      // Handle date search (YYYY-MM-DD format)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(trimmedQuery)) {
        const startDate = new Date(trimmedQuery);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1); // Include full day
        query.$or.push({
          orderDate: { $gte: startDate, $lt: endDate }
        });
      }
    }

    console.log('Search query:', JSON.stringify(query, null, 2)); // Improved debug log
    const orders = await Orders.find(query).populate('acc_id', 'username name');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: 'Error searching orders', error: error.message });
  }
});

// Get a single order by ID (Admin/Manager or own order for User)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id).populate('acc_id', 'username name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.acc_id._id.toString() !== req.user.id) {
      console.log('Access denied:', { userId: req.user.id, orderAccId: order.acc_id._id.toString() });
      return res.status(403).json({ message: 'Access denied: Can only view own order' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Get order error:', error.message);
    res.status(500).json({ message: 'Error retrieving order', error: error.message });
  }
});

// Update an order (Admin/Manager or own order for User)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.acc_id.toString() !== req.user.id) {
      console.log('Access denied:', { userId: req.user.id, orderAccId: order.acc_id.toString() });
      return res.status(403).json({ message: 'Access denied: Can only update own order' });
    }

    const { acc_id, username, ...updateData } = req.body;
    if (acc_id || username) {
      const account = await Accounts.findById(acc_id || order.acc_id);
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
    }

    const updatedOrder = await Orders.findByIdAndUpdate(
      req.params.id,
      { ...updateData, ...(acc_id && { acc_id }), ...(username && { username }) },
      { new: true, runValidators: true }
    ).populate('acc_id', 'username name');

    res.status(200).json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error.message);
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// Delete an order (Admin/Manager or own order for User)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.acc_id.toString() !== req.user.id) {
      console.log('Access denied:', { userId: req.user.id, orderAccId: order.acc_id.toString() });
      return res.status(403).json({ message: 'Access denied: Can only delete own order' });
    }
    await Orders.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error.message);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
});

module.exports = router;