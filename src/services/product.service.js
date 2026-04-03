const productModel = require("../models/product.model");
const { createHttpError } = require("../utils/errors");
const {
  requireNonEmptyString,
  requireNonNegativeNumber,
  optionalString,
  parseBoolean,
} = require("../utils/validators");

const normalizeProduct = (product) => ({
  ...product,
  price: Number(product.price),
});

const getAllProducts = async ({ includeUnavailable = false } = {}) => {
  const products = await productModel.findAll({ includeUnavailable });
  return products.map(normalizeProduct);
};

const getProductById = async (id) => {
  const product = await productModel.findById(id);

  if (!product) {
    throw createHttpError(404, "Product not found.");
  }

  return normalizeProduct(product);
};

const createProduct = async (payload) => {
  const product = await productModel.create({
    name: requireNonEmptyString(payload.name, "Product name"),
    price: requireNonNegativeNumber(payload.price, "Price"),
    unit: requireNonEmptyString(payload.unit, "Unit"),
    description: optionalString(payload.description),
    imageUrl: optionalString(payload.image_url),
    category: optionalString(payload.category),
    isAvailable: parseBoolean(payload.is_available, true),
  });

  return normalizeProduct(product);
};

const updateProduct = async (id, payload) => {
  const existing = await productModel.findById(id);

  if (!existing) {
    throw createHttpError(404, "Product not found.");
  }

  const product = await productModel.update({
    id,
    name: requireNonEmptyString(payload.name ?? existing.name, "Product name"),
    price: requireNonNegativeNumber(payload.price ?? existing.price, "Price"),
    unit: requireNonEmptyString(payload.unit ?? existing.unit, "Unit"),
    description: optionalString(payload.description ?? existing.description),
    imageUrl: optionalString(payload.image_url ?? existing.image_url),
    category: optionalString(payload.category ?? existing.category),
    isAvailable: parseBoolean(payload.is_available, existing.is_available),
  });

  return normalizeProduct(product);
};

const disableProduct = async (id) => {
  const product = await productModel.disable(id);

  if (!product) {
    throw createHttpError(404, "Product not found.");
  }

  return normalizeProduct(product);
};

const enableProduct = async (id) => {
  const product = await productModel.enable(id);

  if (!product) {
    throw createHttpError(404, "Product not found.");
  }

  return normalizeProduct(product);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  disableProduct,
  enableProduct,
};
