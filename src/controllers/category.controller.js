const categoryService = require("../services/category.service");

const getCategories = async (req, res) => {
  const categories = await categoryService.getCategories({
    includeUnavailable: req.query.includeUnavailable === "true",
    includeItems: req.query.includeItems === "true",
  });

  res.status(200).json({
    success: true,
    data: categories,
  });
};

const getMenu = async (req, res) => {
  const menu = await categoryService.getPublicMenu();
  res.status(200).json(menu);
};

const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  res.status(201).json({
    success: true,
    data: category,
  });
};

const updateCategory = async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
};

const disableCategory = async (req, res) => {
  const category = await categoryService.disableCategory(req.params.id);

  res.status(200).json({
    success: true,
    data: category,
  });
};

const enableCategory = async (req, res) => {
  const category = await categoryService.enableCategory(req.params.id);

  res.status(200).json({
    success: true,
    data: category,
  });
};

module.exports = {
  getCategories,
  getMenu,
  createCategory,
  updateCategory,
  disableCategory,
  enableCategory,
};
