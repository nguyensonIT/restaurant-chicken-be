const Product = require("../models/Product")
const Category = require("../models/Category")

class ProductController {
    //[GET] /all product
    async getAllProducts(req, res) {
      try {
        const products = await Product.find().populate('category');
      // Tạo một đối tượng để nhóm sản phẩm theo category
        const categoriesMap = {};

        products.forEach(product => {
        const categoryId = product.category._id.toString();
      
      // Kiểm tra nếu danh mục chưa có trong categoriesMap
        if (!categoriesMap[categoryId]) {
          categoriesMap[categoryId] = {
            idCategory: categoryId,
            nameCategory: product.category.nameCategory,
            order: product.category.order,
            products: []
          };
        }
      
      // Thêm sản phẩm vào danh mục tương ứng
        categoriesMap[categoryId].products.push({
          idProduct: product._id.toString(),
          imgProduct: product.imgProduct,
          nameProduct: product.nameProduct,
          priceProduct: product.priceProduct,
          descProduct: product.descProduct,
          category: {
            idCategory: categoryId,
            nameCategory: product.category.nameCategory,
          },
          isActive: product.isActive,
          sale: product.sale,
          newProduct: product.newProduct,
          hotProduct: product.hotProduct,
        });
    });

    // Chuyển categoriesMap thành mảng để gửi về client
    const result = Object.values(categoriesMap);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
      };

      //[GET] /get products by category
    async getProductsByCategory(req, res) {
      try {
        const { categoryId } = req.params;
        console.log(req.params);
        
    
        // Kiểm tra xem danh mục có tồn tại không (tùy chọn)
        const category = await Category.findById(categoryId);
        if (!category) return res.status(404).json({ message: 'Category not found' });
    
        // Tìm tất cả sản phẩm theo danh mục
        const products = await Product.find({ category: categoryId }).populate('category');
    
        // Trả về danh sách sản phẩm
        res.json(products);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    };

    //[GET] /id product
    async getProductById(req, res){
      try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
      };

    //[POST] /create product
    async createProduct(req, res) {
        try {

          // Tìm danh mục theo tên
          const category = await Category.findById(req.body.category);
          if (!category) return res.status(400).json({ message: 'Invalid category ID' });
        
          const product = new Product({
            nameProduct: req.body.nameProduct,
            priceProduct: req.body.priceProduct,
            imgProduct: req.body.imgProduct,
            descProduct: req.body.descProduct,
            category: req.body.category
          });
          const newProduct = await product.save();
          res.status(201).json(newProduct);
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      };

    //[POST] /update is active product
    async updateIsActiveProduct (req, res) {
      const { id, isActive } = req.body;
    
      // Kiểm tra đầu vào
      if (!id || typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'Invalid input' });
      }
    
      try {
        // Cập nhật sản phẩm với ID duy nhất
        const updateResult = await Product.updateOne(
          { _id: id },
          { $set: { isActive: isActive } }
        );
    
        if (updateResult.nModified === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        // Lấy thông tin sản phẩm đã được cập nhật
        const updatedProduct = await Product.findById(id);
    
        res.status(200).json({ message: 'IsActive status updated', data: updatedProduct });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }

    //[PUT] /update product
    async updateProduct(req, res) {
      try {
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).json({ message: 'Invalid category ID' });
    
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
      };

    //[DELETE] /delete product
    async deleteProduct(req, res) {
      try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
      };
}

module.exports = new ProductController