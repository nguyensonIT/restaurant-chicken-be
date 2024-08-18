const express = require('express');
const router = express.Router();

const productController = require('../app/controllers/ProductController');
const protect = require('../app/middleware/authMiddleware')

router.get('/', productController.getAllProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.post('/',protect, productController.createProduct);
router.post('/update-active',protect, productController.updateIsActiveProduct);
router.put('/:id',protect, productController.updateProduct);
router.delete('/:id',protect, productController.deleteProduct);

module.exports = router;
