const analyticsService = require("../services/analytics.service");

const getOrdersTrend = async (req, res) => {
  const data = await analyticsService.getOrdersTrend();

  res.status(200).json({
    success: true,
    data,
  });
};

const getRevenueTrend = async (req, res) => {
  const data = await analyticsService.getRevenueTrend();

  res.status(200).json({
    success: true,
    data,
  });
};

const getTopItems = async (req, res) => {
  const data = await analyticsService.getTopItems();

  res.status(200).json({
    success: true,
    data,
  });
};

const getOrderStatus = async (req, res) => {
  const data = await analyticsService.getOrderStatusDistribution();

  res.status(200).json({
    success: true,
    data,
  });
};

const getSummary = async (req, res) => {
  const data = await analyticsService.getSummary();

  res.status(200).json({
    success: true,
    data,
  });
};

module.exports = {
  getOrdersTrend,
  getRevenueTrend,
  getTopItems,
  getOrderStatus,
  getSummary,
};
