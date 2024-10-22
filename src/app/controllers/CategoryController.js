const Category = require("../models/Category")
const Product = require("../models/Product")

class CategoryController {
    //[GET] /all category
    async getAllCategories(req, res) {
      try {
          // Lấy tất cả danh mục
          const categories = await Category.find();
  
          // Lấy tất cả sản phẩm
          const products = await Product.find();
  
          // Nhóm sản phẩm theo ID danh mục
          const productsByCategoryId = products.reduce((acc, product) => {
              const categoryId = product.category.toString();
              if (!acc[categoryId]) {
                  acc[categoryId] = [];
              }
              acc[categoryId].push(product);
              return acc;
          }, {});
  
          // Thêm sản phẩm vào từng danh mục
          const categoriesWithProducts = categories.map(category => {
              return {
                  ...category.toObject(), // Chuyển đổi danh mục sang đối tượng
                  products: productsByCategoryId[category._id.toString()] || [] // Thêm sản phẩm hoặc mảng rỗng nếu không có sản phẩm
              };
          });
  
          res.json(categoriesWithProducts);
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  }
  

    //[GET] /id category
    async getCategoryById(req, res) {
      try {
          const category = await Category.findById(req.params.id).populate('products'); // Sử dụng populate để lấy sản phẩm
          if (!category) {
              return res.status(404).json({ message: 'Category not found' });
          }
          res.json(category);
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  }
    

    // [POST] /create category
    async createCategory(req, res) {
      const { nameCategory } = req.body;

      // Kiểm tra xem nameCategory có tồn tại và không rỗng
      if (!nameCategory || typeof nameCategory !== 'string') {
          return res.status(400).json({ message: 'Invalid category name' });
      }

      try {
          // Đếm số lượng danh mục hiện tại
          const categoryCount = await Category.countDocuments();

          // Tạo danh mục mới với order bằng số lượng hiện tại cộng thêm 1
          const category = new Category({
              nameCategory,
              order: categoryCount + 1, // Đặt order
          });

          const newCategory = await category.save();
          res.status(201).json(newCategory);
      } catch (error) {
          res.status(400).json({ message: error.message });
      }
    }


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

    // [DELETE] /category/:id
    async deleteCategory(req, res) {
      try {
          const category = await Category.findById(req.params.id);
          if (!category) return res.status(404).json({ message: 'Category not found' });
          
          // Xóa tất cả sản phẩm thuộc danh mục
          await Product.deleteMany({ category: req.params.id });

          // Lưu lại thứ tự để cập nhật cho các danh mục còn lại
          const orderToRemove = category.order;

          // Xóa danh mục
          await Category.findByIdAndDelete(req.params.id);

          // Cập nhật lại thứ tự cho các danh mục còn lại
          await Category.updateMany(
              { order: { $gt: orderToRemove } },
              { $inc: { order: -1 } }
          );

          res.json({ message: 'Category deleted' });
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
    }


    // [PUT] /reorder categories
    async reorderCategories(req, res) {
      console.log(req.body);
      
      const { orderList } = req.body; // orderList là một mảng các ID danh mục theo thứ tự mới
    
      try {
          // Kiểm tra nếu orderList là mảng và không rỗng
          if (!Array.isArray(orderList) || orderList.length === 0) {
              return res.status(400).json({ message: 'Invalid order list' });
          }

    
          // Cập nhật thứ tự cho từng danh mục
          for (let i = 0; i < orderList.length; i++) {
              await Category.findByIdAndUpdate(orderList[i], { order: i + 1 });
          }
    
          res.status(200).json({ message: 'Categories reordered successfully' });
      } catch (error) {
          res.status(400).json({ message: error.message });
      }
    }
}



module.exports = new CategoryController