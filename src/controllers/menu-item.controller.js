const menuItemService = require("../services/menu-item.service");

const getMenuItems = async (req, res) => {
  const items = await menuItemService.getMenuItems({
    includeUnavailable: req.query.includeUnavailable === "true",
  });

  res.status(200).json({
    success: true,
    data: items,
  });
};

const createMenuItem = async (req, res) => {
  const item = await menuItemService.createMenuItem(req.body);

  res.status(201).json({
    success: true,
    data: item,
  });
};

const updateMenuItem = async (req, res) => {
  const item = await menuItemService.updateMenuItem(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: item,
  });
};

const disableMenuItem = async (req, res) => {
  const item = await menuItemService.disableMenuItem(req.params.id);

  res.status(200).json({
    success: true,
    data: item,
  });
};

const enableMenuItem = async (req, res) => {
  const item = await menuItemService.enableMenuItem(req.params.id);

  res.status(200).json({
    success: true,
    data: item,
  });
};

module.exports = {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  disableMenuItem,
  enableMenuItem,
};
