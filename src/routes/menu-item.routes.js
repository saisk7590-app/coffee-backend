const express = require("express");
const menuItemController = require("../controllers/menu-item.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(menuItemController.getMenuItems));
router.post("/", asyncHandler(menuItemController.createMenuItem));
router.put("/:id", asyncHandler(menuItemController.updateMenuItem));
router.patch("/:id/disable", asyncHandler(menuItemController.disableMenuItem));
router.patch("/:id/enable", asyncHandler(menuItemController.enableMenuItem));

module.exports = router;
