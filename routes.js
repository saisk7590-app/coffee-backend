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

// Update order status (Pending → In Progress → Ready → Served)
router.put("/orders/status", controller.updateOrderStatus);

// ================= LOGIN =================
router.post("/login", controller.login);

// Protected routes
router.get("/me", authMiddleware, controllers.getProfile);
router.put("/me", authMiddleware, controllers.updateProfile);
router.put("/change-password", authMiddleware, controllers.changePassword);

module.exports = router;
