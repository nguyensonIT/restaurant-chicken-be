const express = require('express');
const router = express.Router();

const productController = require('../app/controllers/ProductController');
const protect = require('../app/middleware/authMiddleware')
const upload  = require('../app/middleware/uploadMiddleware');

router.get('/', productController.getAllProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.post('/',[protect,upload.single('image')], productController.createProduct);
router.post('/update-active',protect, productController.updateIsActiveProduct);
router.put('/:id',[protect,upload.single('image')], productController.updateProduct);
router.delete('/:id',protect, productController.deleteProduct);

module.exports = router;
