const Product = require("../models/Product")

class SiteController {
    //[POST] /update sale
    async updateSale (req, res) {
        const { ids, sale } = req.body;
      
        if (!Array.isArray(ids) || ids.length === 0 || typeof sale !== 'number' || sale < 0 || sale > 100) {
          return res.status(400).json({ error: 'Invalid input' });
        }
      
        try {
          const updateResult = await Product.updateMany(
            { _id: { $in: ids } },
            { $set: { sale: sale } },
            { multi: true }
          );
      
          res.status(200).json({ message: 'Sale percentage updated', updatedCount: updateResult.nModified });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    
    //[POST] /update new product
    async updateNewProduct (req, res) {
      const { ids, newProduct } = req.body;
    
      // Kiểm tra đầu vào
      if (!Array.isArray(ids) || ids.length === 0 || typeof newProduct !== 'boolean') {
        return res.status(400).json({ error: 'Invalid input' });
      }
    
      try {
        // Cập nhật các sản phẩm với ID trong danh sách
        const updateResult = await Product.updateMany(
          { _id: { $in: ids } },
          { $set: { newProduct: newProduct } },
          { multi: true }
        );
    
        res.status(200).json({ message: 'New product status updated', updatedCount: updateResult.nModified });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }

    //[POST] /update hot product
    async updateHotProduct (req, res) {
      const { ids, hotProduct } = req.body;
    
      // Kiểm tra đầu vào
      if (!Array.isArray(ids) || ids.length === 0 || typeof hotProduct !== 'boolean') {
        return res.status(400).json({ error: 'Invalid input' });
      }
    
      try {
        // Cập nhật các sản phẩm với ID trong danh sách
        const updateResult = await Product.updateMany(
          { _id: { $in: ids } },
          { $set: { hotProduct: hotProduct } },
          { multi: true }
        );
    
        res.status(200).json({ message: 'Hot product status updated', updatedCount: updateResult.nModified });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
}

module.exports = new SiteController