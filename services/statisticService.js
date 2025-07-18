const Orders = require('../models/Orders');
const Accounts = require('../models/Accounts');
const mongoose = require('mongoose');

exports.getCustomerStats = async () => {
  const totalCustomers = await Accounts.countDocuments();
  const activeCustomers = await Accounts.countDocuments({ acc_status: 'active' });
  const inactiveCustomers = await Accounts.countDocuments({ acc_status: 'inactive' });
  const suspendedCustomers = await Accounts.countDocuments({ acc_status: 'suspended' });
  const roleCounts = await Accounts.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    suspendedCustomers,
    roleCounts
  };
};

exports.getRevenueStats = async () => {
  const totalRevenue = await Orders.aggregate([
    { $match: { pay_status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  const averageOrderValue = await Orders.aggregate([
    { $match: { pay_status: 'paid' } },
    { $group: { _id: null, avg: { $avg: '$totalPrice' } } }
  ]);
  return {
    totalRevenue: totalRevenue[0]?.total || 0,
    averageOrderValue: averageOrderValue[0]?.avg || 0
  };
};

exports.getOrderStats = async () => {
  const totalOrders = await Orders.countDocuments();
  const statusCounts = await Orders.aggregate([
    { $group: { _id: '$order_status', count: { $sum: 1 } } }
  ]);
  const payStatusCounts = await Orders.aggregate([
    { $group: { _id: '$pay_status', count: { $sum: 1 } } }
  ]);
  const shippingStatusCounts = await Orders.aggregate([
    { $group: { _id: '$shipping_status', count: { $sum: 1 } } }
  ]);
  return {
    totalOrders,
    statusCounts,
    payStatusCounts,
    shippingStatusCounts
  };
};

exports.getRevenueByWeek = async () => {
  return await Orders.aggregate([
    { $match: { pay_status: 'paid' } },
    {
      $group: {
        _id: { $week: '$orderDate' },
        totalRevenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

exports.getRevenueByMonth = async () => {
  return await Orders.aggregate([
    { $match: { pay_status: 'paid' } },
    {
      $group: {
        _id: { $month: '$orderDate' },
        totalRevenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

exports.getRevenueByYear = async () => {
  return await Orders.aggregate([
    { $match: { pay_status: 'paid' } },
    {
      $group: {
        _id: { $year: '$orderDate' },
        totalRevenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};