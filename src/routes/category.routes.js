const express = require("express");
const categoryController = require("../controllers/category.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(categoryController.getCategories));
router.post("/", asyncHandler(categoryController.createCategory));
router.put("/:id", asyncHandler(categoryController.updateCategory));
router.patch("/:id/disable", asyncHandler(categoryController.disableCategory));
router.patch("/:id/enable", asyncHandler(categoryController.enableCategory));

module.exports = router;
