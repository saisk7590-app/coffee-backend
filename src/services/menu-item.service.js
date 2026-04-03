const categoryModel = require("../models/category.model");
const menuItemModel = require("../models/menu-item.model");
const { createHttpError } = require("../utils/errors");
const {
  requireNonEmptyString,
  requireNonNegativeNumber,
  optionalString,
  parseBoolean,
} = require("../utils/validators");

const normalizeMenuItem = (item) => ({
  ...item,
  price: Number(item.price),
});

const ensureCategoryExists = async (categoryId) => {
  const category = await categoryModel.findById(categoryId);

  if (!category) {
    throw createHttpError(400, "Valid category_id is required.");
  }
};

const getMenuItems = async ({ includeUnavailable = false } = {}) => {
  const items = await menuItemModel.findAll({ includeUnavailable });
  return items.map(normalizeMenuItem);
};

const createMenuItem = async (payload) => {
  await ensureCategoryExists(payload.category_id);

  const item = await menuItemModel.create({
    name: requireNonEmptyString(payload.name, "Menu item name"),
    price: requireNonNegativeNumber(payload.price, "Price"),
    imageUrl: optionalString(payload.image_url),
    categoryId: payload.category_id,
    isAvailable: parseBoolean(payload.is_available, true),
  });

  return normalizeMenuItem(item);
};

const updateMenuItem = async (id, payload) => {
  const existing = await menuItemModel.findById(id);

  if (!existing) {
    throw createHttpError(404, "Menu item not found.");
  }

  const categoryId = payload.category_id ?? existing.category_id;
  await ensureCategoryExists(categoryId);

  const item = await menuItemModel.update({
    id,
    name: requireNonEmptyString(payload.name ?? existing.name, "Menu item name"),
    price: requireNonNegativeNumber(payload.price ?? existing.price, "Price"),
    imageUrl: optionalString(payload.image_url ?? existing.image_url),
    categoryId,
    isAvailable: parseBoolean(payload.is_available, existing.is_available),
  });

  return normalizeMenuItem(item);
};

const disableMenuItem = async (id) => {
  const item = await menuItemModel.disable(id);

  if (!item) {
    throw createHttpError(404, "Menu item not found.");
  }

  return normalizeMenuItem(item);
};

const enableMenuItem = async (id) => {
  const existing = await menuItemModel.findById(id);

  if (!existing) {
    throw createHttpError(404, "Menu item not found.");
  }

  const category = await categoryModel.findById(existing.category_id);

  if (!category || !category.is_available) {
    throw createHttpError(400, "Enable the category before enabling this menu item.");
  }

  const item = await menuItemModel.enable(id);
  return normalizeMenuItem(item);
};

module.exports = {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  disableMenuItem,
  enableMenuItem,
};
