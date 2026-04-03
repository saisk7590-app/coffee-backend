const express = require("express");
const productController = require("../controllers/product.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(productController.getProducts));
router.post("/", asyncHandler(productController.createProduct));
router.get("/:id", asyncHandler(productController.getProduct));
router.put("/:id", asyncHandler(productController.updateProduct));
router.patch("/:id/disable", asyncHandler(productController.disableProduct));
router.patch("/:id/enable", asyncHandler(productController.enableProduct));

module.exports = router;
