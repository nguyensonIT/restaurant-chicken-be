const Category = require("../models/Category")
const Product = require("../models/Product")

class CategoryController {
    //[GET] /all category
    async getAllCategories(req, res) {
        try {
          const categories = await Category.find();
          res.json(categories);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
    };

    //[GET] /id category
    async getCategoryById(req, res) {
        try {
          const category = await Category.findById(req.params.id);
          if (!category) return res.status(404).json({ message: 'Category not found' });
          res.json(category);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
    }
    

    //[POST] /create category
    async createCategory(req, res) {
        const category = new Category({
          nameCategory: req.body.nameCategory,
        });
        try {
          const newCategory = await category.save();
          res.status(201).json(newCategory);
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      };

    //[PUT] /update category
    async updateCategory(req, res) {
        try {
          const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
          if (!category) return res.status(404).json({ message: 'Category not found' });
          res.json(category);
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
    };

    //[DELETE] /category
    async deleteCategory(req, res) {
        try {
          const category = await Category.findById(req.params.id);
          if (!category) return res.status(404).json({ message: 'Category not found' });
          
          // Xóa tất cả sản phẩm thuộc danh mục
          await Product.deleteMany({ category: req.params.id });

          // Xóa danh mục
          await Category.findByIdAndDelete(req.params.id);

          res.json({ message: 'Category deleted' });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      };

}

module.exports = new CategoryController