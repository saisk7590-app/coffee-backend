const express = require("express");
const orderController = require("../controllers/order.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/summary", asyncHandler(orderController.getDashboardSummary));

module.exports = router;
