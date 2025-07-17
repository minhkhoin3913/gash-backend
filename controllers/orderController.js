const orderService = require('../services/orderService');
const vnpayService = require('../services/vnpayService');

exports.createOrder = async (req, res) => {
  try {
    const savedOrder = await orderService.createOrderService(req.body, req.user);
    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating order' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrdersService(req.user);
    res.status(200).json(orders);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving orders' });
  }
};

exports.searchOrders = async (req, res) => {
  try {
    const orders = await orderService.searchOrdersService(req.query, req.user);
    res.status(200).json(orders);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error searching orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderByIdService(req.params.id, req.user);
    res.status(200).json(order);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error retrieving order' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await orderService.updateOrderService(req.params.id, req.body, req.user);
    res.status(200).json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error updating order' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const result = await orderService.deleteOrderService(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error deleting order' });
  }
};

exports.createVnpayPaymentUrl = async (req, res) => {
  try {
    const { orderId, bankCode, language } = req.body;
    const paymentUrl = await vnpayService.createPaymentUrl(orderId, bankCode, language, req.user, req);
    res.json({ paymentUrl });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating payment URL' });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    const result = await vnpayService.handleReturn(req.query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Payment verification failed' });
  }
};

exports.vnpayIpn = async (req, res) => {
  try {
    const result = await vnpayService.handleIpn(req.query);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message || 'IPN verification failed' });
  }
}; 