const orderService = require("../services/order.service");

const getOrders = async (req, res) => {
  const orders = await orderService.getOrders();
  res.status(200).json(orders);
};

const createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.body);

  res.status(201).json({
    orderNo: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
  });
};

const updateOrderStatus = async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);

  res.status(200).json({
    success: true,
    data: order,
  });
};

const updateOrderStatusLegacy = async (req, res) => {
  const order = await orderService.updateOrderStatusLegacy(req.body);

  res.status(200).json({
    success: true,
    data: order,
  });
};

const getDashboardSummary = async (req, res) => {
  const summary = await orderService.getDashboardSummary();

  res.status(200).json({
    success: true,
    data: summary,
  });
};

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus,
  updateOrderStatusLegacy,
  getDashboardSummary,
};
