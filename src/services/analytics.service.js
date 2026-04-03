const analyticsModel = require("../models/analytics.model");

const getOrdersTrend = async () => {
  const rows = await analyticsModel.getOrdersTrend();
  return rows.map((row) => ({
    date: row.date,
    total_orders: Number(row.total_orders),
  }));
};

const getRevenueTrend = async () => {
  const rows = await analyticsModel.getRevenueTrend();
  return rows.map((row) => ({
    date: row.date,
    total_revenue: Number(row.total_revenue),
  }));
};

const getTopItems = async () => {
  const rows = await analyticsModel.getTopItems();
  return rows.map((row) => ({
    id: row.id,
    item_name: row.item_name,
    item_type: row.item_type,
    total_quantity: Number(row.total_quantity),
  }));
};

const getOrderStatusDistribution = async () => {
  const row = await analyticsModel.getOrderStatusDistribution();

  return {
    Pending: Number(row.pending),
    Ready: Number(row.ready),
    Completed: Number(row.completed),
  };
};

const getSummary = async () => {
  const row = await analyticsModel.getSummary();

  return {
    total_orders: Number(row.total_orders),
    today_orders: Number(row.today_orders),
    today_revenue: Number(row.today_revenue),
    total_products: Number(row.total_products),
    pending_orders: Number(row.pending_orders),
    ready_orders: Number(row.ready_orders),
  };
};

module.exports = {
  getOrdersTrend,
  getRevenueTrend,
  getTopItems,
  getOrderStatusDistribution,
  getSummary,
};
