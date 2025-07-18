const statisticService = require('../services/statisticService');

exports.viewCustomerStats = async (req, res) => {
  try {
    const stats = await statisticService.getCustomerStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customer statistics', error: error.message });
  }
};

exports.viewRevenueStats = async (req, res) => {
  try {
    const stats = await statisticService.getRevenueStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving revenue statistics', error: error.message });
  }
};

exports.viewOrderStats = async (req, res) => {
  try {
    const stats = await statisticService.getOrderStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order statistics', error: error.message });
  }
};

exports.viewRevenueByWeek = async (req, res) => {
  try {
    const stats = await statisticService.getRevenueByWeek();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving weekly revenue', error: error.message });
  }
};

exports.viewRevenueByMonth = async (req, res) => {
  try {
    const stats = await statisticService.getRevenueByMonth();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving monthly revenue', error: error.message });
  }
};

exports.viewRevenueByYear = async (req, res) => {
  try {
    const stats = await statisticService.getRevenueByYear();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving yearly revenue', error: error.message });
  }
};