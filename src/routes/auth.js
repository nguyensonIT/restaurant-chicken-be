const express = require("express");
const router = express.Router();
const authController = require("../app/controllers/AuthController");
const protect = require("../app/middleware/authMiddleware");
const upload = require("../app/middleware/uploadMiddleware");
const verifyToken = require("../app/middleware/verifyToken");
const checkAdmin = require("../app/middleware/checkAdmin");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.put(
  "/update-profile",
  [protect, upload.single("image")],
  authController.updateProfile
);
router.put("/change-password", protect, authController.changePassword);
router.get("/users", verifyToken, checkAdmin, authController.getAllUsers);
router.delete("/users/:id", verifyToken, checkAdmin, authController.deleteUser);

module.exports = router;
