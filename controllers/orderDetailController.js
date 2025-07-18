const orderDetailService = require('../services/orderDetailService');
const mongoose = require('mongoose');

// Advanced search/filter for order details with feedback
exports.searchOrderDetails = async (req, res) => {
  try {
    const result = await orderDetailService.searchOrderDetails(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error searching feedbacks', error: error.message });
  }
};

// Create a new order detail
exports.createOrderDetail = async (req, res) => {
  try {
    const result = await orderDetailService.createOrderDetail(req.body, req.user);
    res.status(result.status).json(result.response);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order detail', error: error.message });
  }
};

// Get all order details
exports.getAllOrderDetails = async (req, res) => {
  try {
    const { order_id } = req.query;
    const result = await orderDetailService.getAllOrderDetails(req.user, order_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order details', error: error.message });
  }
};

// Get a single order detail by ID
exports.getOrderDetailById = async (req, res) => {
  try {
    const result = await orderDetailService.getOrderDetailById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Order detail not found' });
    }
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'manager' &&
      result.order_id.acc_id._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied: Can only view own order detail' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order detail', error: error.message });
  }
};

// Update an order detail
exports.updateOrderDetail = async (req, res) => {
  try {
    const result = await orderDetailService.updateOrderDetail(req.params.id, req.body, req.user);
    res.status(result.status).json(result.response);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order detail', error: error.message });
  }
};

// Delete an order detail
exports.deleteOrderDetail = async (req, res) => {
  try {
    const result = await orderDetailService.deleteOrderDetail(req.params.id, req.user);
    res.status(result.status).json(result.response);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order detail', error: error.message });
  }
};

// Get all order details for a product with non-empty feedback
exports.getOrderDetailsByProduct = async (req, res) => {
  try {
    const result = await orderDetailService.getOrderDetailsByProduct(req.params.pro_id);
    if (!result.length) {
      return res.status(404).json({ message: 'No feedback found for this product' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product feedback', error: error.message });
  }
};