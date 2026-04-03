const menuItemModel = require("../models/menu-item.model");
const productModel = require("../models/product.model");
const orderModel = require("../models/order.model");
const { createHttpError } = require("../utils/errors");
const {
  requirePositiveInteger,
  requireNonNegativeNumber,
} = require("../utils/validators");

const ADMIN_STATUSES = ["Pending", "Ready", "Completed"];
const LEGACY_STATUSES = ["Pending", "In Progress", "Ready", "Served", "Completed"];

const normalizeOrder = (order) => ({
  id: order.id,
  orderNo: order.id,
  orderTime: order.created_at,
  created_at: order.created_at,
  status: order.status,
  total_amount: Number(order.total_amount),
  totalAmount: Number(order.total_amount),
  items: (order.items || []).map((item) => ({
    id: item.id,
    order_id: item.order_id,
    item_type: item.item_type,
    item_id: item.item_id,
    quantity: Number(item.quantity),
    qty: Number(item.quantity),
    price: Number(item.price),
    name: item.item_name,
  })),
});

const getOrders = async () => {
  const orders = await orderModel.findAll();
  return orders.map(normalizeOrder);
};

const resolveItemReference = async (item) => {
  const itemType = item.itemType || item.item_type || "menu";
  const itemId = item.itemId || item.item_id || item.id;

  if (!itemId) {
    throw createHttpError(400, "Each order item must include an item id.");
  }

  if (itemType === "menu") {
    const menuItem = await menuItemModel.findById(itemId);

    if (!menuItem || !menuItem.is_available) {
      throw createHttpError(400, "Order contains an unavailable menu item.");
    }
  } else if (itemType === "product") {
    const product = await productModel.findById(itemId);

    if (!product || !product.is_available) {
      throw createHttpError(400, "Order contains an unavailable product.");
    }
  } else {
    throw createHttpError(400, "item_type must be either 'menu' or 'product'.");
  }

  return {
    itemType,
    itemId,
    quantity: requirePositiveInteger(item.quantity ?? item.qty, "Quantity"),
    price: requireNonNegativeNumber(item.price, "Price"),
  };
};

const createOrder = async (payload) => {
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (items.length === 0) {
    throw createHttpError(400, "At least one order item is required.");
  }

  const normalizedItems = [];

  for (const item of items) {
    normalizedItems.push(await resolveItemReference(item));
  }

  const totalAmount = normalizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await orderModel.create({
    items: normalizedItems,
    totalAmount,
    status: "Pending",
  });

  return normalizeOrder(order);
};

const updateOrderStatus = async (id, status) => {
  if (!ADMIN_STATUSES.includes(status)) {
    throw createHttpError(400, `Status must be one of: ${ADMIN_STATUSES.join(", ")}.`);
  }

  const order = await orderModel.updateStatus(id, status);

  if (!order) {
    throw createHttpError(404, "Order not found.");
  }

  return normalizeOrder(order);
};

const updateOrderStatusLegacy = async ({ orderNo, status }) => {
  if (!orderNo) {
    throw createHttpError(400, "orderNo is required.");
  }

  if (!LEGACY_STATUSES.includes(status)) {
    throw createHttpError(400, `Status must be one of: ${LEGACY_STATUSES.join(", ")}.`);
  }

  const order = await orderModel.updateStatus(orderNo, status);

  if (!order) {
    throw createHttpError(404, "Order not found.");
  }

  return normalizeOrder(order);
};

const getDashboardSummary = async () => {
  const summary = await orderModel.getDashboardSummary();

  return {
    totalOrders: Number(summary.total_orders),
    pendingOrders: Number(summary.pending_orders),
    readyOrders: Number(summary.ready_orders),
    totalProducts: Number(summary.total_products),
    todayOrders: Number(summary.today_orders),
    todayRevenue: Number(summary.today_revenue),
  };
};

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus,
  updateOrderStatusLegacy,
  getDashboardSummary,
};
