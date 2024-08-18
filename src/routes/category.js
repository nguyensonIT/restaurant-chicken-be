const express = require('express');
const router = express.Router();

const categoryController = require('../app/controllers/CategoryController');
const protect = require('../app/middleware/authMiddleware')

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/',protect, categoryController.createCategory);
router.put('/:id',protect, categoryController.updateCategory);
router.delete('/:id',protect, categoryController.deleteCategory);

module.exports = router;
