const express = require('express');
const router = express.Router();

const protect = require('../app/middleware/authMiddleware')
const orderController = require('../app/controllers/OrderController');

router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.post('/delivered',protect, orderController.updateIsDelivered);
router.post('/canceled',protect, orderController.updateIsCanceled);
router.post('/preparing',protect, orderController.updateIsPreparing);

module.exports = router;