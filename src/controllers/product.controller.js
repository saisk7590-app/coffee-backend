const productService = require("../services/product.service");

const getProducts = async (req, res) => {
  const products = await productService.getAllProducts({
    includeUnavailable: req.query.includeUnavailable === "true",
  });

  res.status(200).json({
    success: true,
    data: products,
  });
};

const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    data: product,
  });
};

const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json({
    success: true,
    data: product,
  });
};

const updateProduct = async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: product,
  });
};

const disableProduct = async (req, res) => {
  const product = await productService.disableProduct(req.params.id);

  res.status(200).json({
    success: true,
    data: product,
  });
};

const enableProduct = async (req, res) => {
  const product = await productService.enableProduct(req.params.id);

  res.status(200).json({
    success: true,
    data: product,
  });
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  disableProduct,
  enableProduct,
};
