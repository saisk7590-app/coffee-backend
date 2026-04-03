const express = require("express");
const router = express.Router();
const controller = require("./controllers");
const { authMiddleware } = require("./middleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/owner-contact", controller.getOwnerContact);

router.get("/me", authMiddleware, controller.getProfile);
router.put("/me", authMiddleware, controller.updateProfile);
router.put("/change-password", authMiddleware, controller.changePassword);

module.exports = router;
