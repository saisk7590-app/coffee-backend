const express = require("express");
const analyticsController = require("../controllers/analytics.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/orders-trend", asyncHandler(analyticsController.getOrdersTrend));
router.get("/top-items", asyncHandler(analyticsController.getTopItems));
router.get("/revenue-trend", asyncHandler(analyticsController.getRevenueTrend));
router.get("/order-status", asyncHandler(analyticsController.getOrderStatus));
router.get("/summary", asyncHandler(analyticsController.getSummary));

module.exports = router;
