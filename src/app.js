const express = require("express");
const cors = require("cors");
const legacyRoutes = require("../routes");
const categoryRoutes = require("./routes/category.routes");
const menuItemRoutes = require("./routes/menu-item.routes");
const orderRoutes = require("./routes/order.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const categoryController = require("./controllers/category.controller");
const productRoutes = require("./routes/product.routes");
const asyncHandler = require("./utils/asyncHandler");

const app = express();

app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Bypass-Tunnel-Reminder"],
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Coffee shop backend is running.",
  });
});

app.use("/api", legacyRoutes);
app.get("/api/menu", asyncHandler(categoryController.getMenu));
app.use("/api/categories", categoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Unhandled application error:", error);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error.",
  });
});

module.exports = app;
