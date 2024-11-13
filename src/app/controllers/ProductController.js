const Product = require("../models/Product")
const Category = require("../models/Category")

const { uploadFileToCloudinary, deleteFileFromCloudinary } = require('../../services/fileUploadService');
const { getPublicIdFromUrl } = require('../../utils/getIdImageCloudinary');

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

    // [POST] /create product
    async createProduct(req, res) {
      try {
          // Tìm danh mục theo ID
          const category = await Category.findById(req.body.category);
          if (!category) return res.status(400).json({ message: 'Invalid category ID' });

          let imageUrl = '';

          // Kiểm tra nếu có ảnh được gửi từ client
          if (req.file) {
              // Upload file ảnh từ form lên Cloudinary
              imageUrl = await uploadFileToCloudinary(req.file, 'uploads/products');
          } else if (req.body.imgProduct && req.body.imgProduct.startsWith('data:image')) {
              // Nếu imgProduct là base64
              const base64Data = req.body.imgProduct.replace(/^data:image\/\w+;base64,/, '');  // Loại bỏ tiền tố
              const buffer = Buffer.from(base64Data, 'base64');  // Chuyển base64 thành Buffer

              const fileName = `product_${Date.now()}.jpeg`;  // Tạo tên file duy nhất
              const fileUpload = {
                  originalname: fileName,
                  mimetype: 'image/jpeg',
                  buffer,  // Sử dụng buffer thay vì file path
              };

              // Upload ảnh base64 lên Cloudinary
              imageUrl = await uploadFileToCloudinary(fileUpload, 'uploads/products');
          } else {
              return res.status(400).json({ message: 'Invalid image data' });
          }

          // Tạo sản phẩm mới với URL ảnh từ Cloudinary
          const product = new Product({
              nameProduct: req.body.nameProduct,
              priceProduct: req.body.priceProduct,
              imgProduct: imageUrl,  // Lưu URL ảnh từ Cloudinary
              descProduct: req.body.descProduct,
              category: req.body.category
          });

          // Lưu sản phẩm vào cơ sở dữ liệu
          const newProduct = await product.save();
          res.status(201).json(newProduct);
      } catch (error) {
          console.error('Error creating product:', error);
          res.status(500).json({ message: 'Server error: ' + error.message });
      }
    }


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

    // [PUT] /update product
    async updateProduct(req, res) {
      try {
          // Kiểm tra danh mục
          const category = await Category.findById(req.body.category);
          if (!category) return res.status(400).json({ message: 'Invalid category ID' });

          // Tìm sản phẩm cần cập nhật
          const product = await Product.findById(req.params.id);
          if (!product) return res.status(404).json({ message: 'Product not found' });

         // Kiểm tra nếu ảnh cũ là URL từ Cloudinary hay base64
          const oldImageIsCloudinaryUrl = product.imgProduct && !product.imgProduct.startsWith('data:image');
          const oldImagePublicId = oldImageIsCloudinaryUrl ? getPublicIdFromUrl(product.imgProduct) : null;

          // Xử lý ảnh nếu có
          let imageUrl = product.imgProduct;  // Giữ nguyên URL ảnh hiện tại nếu không có ảnh mới

          if (req.file) {
              // Nếu ảnh mới được gửi từ form dưới dạng file, upload lên Cloudinary và xóa ảnh cũ
              imageUrl = await uploadFileToCloudinary(req.file, 'uploads/products', oldImagePublicId);
          } else if (req.body.imgProduct && req.body.imgProduct.startsWith('data:image')) {
              // Nếu imgProduct là base64
              const base64Data = req.body.imgProduct.replace(/^data:image\/\w+;base64,/, '');  // Loại bỏ tiền tố
              const buffer = Buffer.from(base64Data, 'base64');  // Chuyển base64 thành Buffer

              const fileName = `product_${Date.now()}.jpeg`;  // Tạo tên file duy nhất
              const fileUpload = {
                  originalname: fileName,
                  mimetype: 'image/jpeg',
                  buffer,  // Sử dụng buffer thay vì file path
              };

              // Upload ảnh base64 lên Cloudinary và xóa ảnh cũ nếu cần
              imageUrl = await uploadFileToCloudinary(fileUpload, 'uploads/products', oldImagePublicId);
          }

          // Cập nhật các trường của sản phẩm
          product.nameProduct = req.body.nameProduct || product.nameProduct;
          product.priceProduct = req.body.priceProduct || product.priceProduct;
          product.imgProduct = imageUrl;  // Cập nhật URL ảnh mới
          product.descProduct = req.body.descProduct || product.descProduct;
          product.category = req.body.category || product.category;

          // Lưu các thay đổi vào cơ sở dữ liệu
          const updatedProduct = await product.save();
          res.json(updatedProduct);
      } catch (err) {
          console.error('Error updating product:', err);
          res.status(500).json({ message: 'Server error: ' + err.message });
      }
    }



    // [DELETE] /delete product
    async deleteProduct(req, res) {
      try {
          const product = await Product.findById(req.params.id);
          if (!product) return res.status(404).json({ message: 'Product not found' });

          // Kiểm tra nếu ảnh là URL từ Cloudinary (không phải base64)
          if (product.imgProduct && !product.imgProduct.startsWith('data:image')) {
              const oldImagePublicId = getPublicIdFromUrl(product.imgProduct);

              // Xóa ảnh từ Cloudinary nếu có `public_id`
              if (oldImagePublicId) {
                  await deleteFileFromCloudinary(oldImagePublicId);
              }
          }

          // Xóa sản phẩm khỏi cơ sở dữ liệu
          await Product.findByIdAndDelete(req.params.id);
          res.json({ message: 'Product deleted' });
      } catch (err) {
          console.error('Error deleting product:', err);
          res.status(500).json({ message: 'Server error: ' + err.message });
      }
    }

}

module.exports = new ProductController