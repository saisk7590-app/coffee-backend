const express = require("express");
const orderController = require("../controllers/order.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(orderController.getOrders));
router.post("/", asyncHandler(orderController.createOrder));
router.put("/status", asyncHandler(orderController.updateOrderStatusLegacy));
router.patch("/:id/status", asyncHandler(orderController.updateOrderStatus));

module.exports = router;
