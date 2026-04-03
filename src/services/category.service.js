const categoryModel = require("../models/category.model");
const { createHttpError } = require("../utils/errors");
const { requireNonEmptyString, parseBoolean } = require("../utils/validators");

const normalizeMenuItem = (item) => ({
  ...item,
  price: Number(item.price),
});

const normalizeCategory = (category) => ({
  ...category,
  items: Array.isArray(category.items) ? category.items.map(normalizeMenuItem) : category.items,
});

const getCategories = async ({ includeUnavailable = false, includeItems = false } = {}) => {
  const categories = await categoryModel.findAll({ includeUnavailable, includeItems });
  return categories.map(normalizeCategory);
};

const getPublicMenu = async () => {
  const rows = await categoryModel.findGroupedAvailableMenu();

  return rows.reduce((acc, row) => {
    if (!acc[row.category_name]) {
      acc[row.category_name] = [];
    }

    acc[row.category_name].push(normalizeMenuItem(row));
    return acc;
  }, {});
};

const createCategory = async (payload) => {
  const category = await categoryModel.create({
    name: requireNonEmptyString(payload.name, "Category name"),
    isAvailable: parseBoolean(payload.is_available, true),
  });

  return normalizeCategory(category);
};

const updateCategory = async (id, payload) => {
  const existing = await categoryModel.findById(id);

  if (!existing) {
    throw createHttpError(404, "Category not found.");
  }

  const updated = await categoryModel.update({
    id,
    name: requireNonEmptyString(payload.name ?? existing.name, "Category name"),
    isAvailable: parseBoolean(payload.is_available, existing.is_available),
  });

  return normalizeCategory(updated);
};

const disableCategory = async (id) => {
  const category = await categoryModel.disableWithItems(id);

  if (!category) {
    throw createHttpError(404, "Category not found.");
  }

  return normalizeCategory(category);
};

const enableCategory = async (id) => {
  const category = await categoryModel.enableWithItems(id);

  if (!category) {
    throw createHttpError(404, "Category not found.");
  }

  return normalizeCategory(category);
};

module.exports = {
  getCategories,
  getPublicMenu,
  createCategory,
  updateCategory,
  disableCategory,
  enableCategory,
};
