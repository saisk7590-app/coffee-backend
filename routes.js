const express = require("express");
const router = express.Router();
const controller = require("./controllers");
const { authMiddleware } = require("./middleware");

// Get full menu
router.get("/menu", controller.getMenu);

// Create a new order
router.post("/orders", controller.createOrder);

// Get all orders (for chef / status screen)
router.get("/orders", controller.getOrders);

// Update order status
router.put("/orders/status", controller.updateOrderStatus);

// Login
router.post("/login", controller.login);

// Protected routes
router.get("/me", authMiddleware, controller.getProfile);
router.put("/me", authMiddleware, controller.updateProfile);
router.put("/change-password", authMiddleware, controller.changePassword);

module.exports = router;
