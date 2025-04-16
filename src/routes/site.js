const express = require("express");
const router = express.Router();

const siteController = require("../app/controllers/SiteController");
const protect = require("../app/middleware/authMiddleware");

router.post("/update-sale", protect, siteController.updateSale);
router.post("/update-new-product", protect, siteController.updateNewProduct);
router.post("/update-hot-product", protect, siteController.updateHotProduct);
router.put("/update-logo", protect, siteController.updateLogo);
router.put("/update-banner", protect, siteController.updateBanner);
router.get("/logo", siteController.getConfig);

module.exports = router;
