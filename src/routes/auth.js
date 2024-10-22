const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');
const protect = require("../app/middleware/authMiddleware")

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.put('/update-profile',protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
