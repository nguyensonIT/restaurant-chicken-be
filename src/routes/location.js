const express = require("express");
const router = express.Router();

const protect = require("../app/middleware/authMiddleware");
const LocationController = require("../app/controllers/LocationController");

router.get("/", LocationController.getLocation);
router.post("/", protect, LocationController.updateLocation);

module.exports = router;
