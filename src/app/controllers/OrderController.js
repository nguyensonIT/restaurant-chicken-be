const Order = require("../models/Order")

class OrderController {

    //POST /order
    async createOrder(req, res) {
        const getNextOrderNumber = async () => {
            const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
            return lastOrder ? lastOrder.orderNumber + 1 : 1;
        };
        
        try {
        const orderNumber = await getNextOrderNumber();

        const order = new Order({
            orderNumber,
            ...req.body,
        });
            await order.save();
            res.status(201).json(order);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    };

    //[POST] /update is delivered order
    async updateIsDelivered (req, res) {
        const { id, isDelivered } = req.body;
      
        // Kiểm tra đầu vào
        if (!id || typeof isDelivered !== 'boolean') {
          return res.status(400).json({ error: 'Invalid input' });
        }
      
        try {
          // Cập nhật sản phẩm với ID duy nhất
          const updateResult = await Order.updateOne(
            { _id: id },
            {
              $set: {
                  'statusOrder.isDelivered': isDelivered,
                  'statusOrder.isCanceled': false,
                  'statusOrder.isPreparing': false
              }
          }
          );
      
          if (updateResult.nModified === 0) {
            return res.status(404).json({ message: 'Product not found' });
          }
  
          // Lấy thông tin sản phẩm đã được cập nhật
          const updatedProduct = await Order.findById(id);
      
          res.status(200).json({ message: 'isDelivered status updated', data: updatedProduct });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    //[POST] /update is Cancel order
    async updateIsCanceled (req, res) {
      const { id, isCanceled } = req.body;
    
      // Kiểm tra đầu vào
      if (!id || typeof isCanceled !== 'boolean') {
        return res.status(400).json({ error: 'Invalid input' });
      }
    
      try {
        // Cập nhật sản phẩm với ID duy nhất
        const updateResult = await Order.updateOne(
          { _id: id },
          {
            $set: {
                'statusOrder.isDelivered': false,
                'statusOrder.isCanceled': isCanceled,
                'statusOrder.isPreparing': false
            }
        }
        );
    
        if (updateResult.nModified === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        // Lấy thông tin sản phẩm đã được cập nhật
        const updatedProduct = await Order.findById(id);
    
        res.status(200).json({ message: 'isCanceled status updated', data: updatedProduct });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    //[POST] /update is Preparing order
    async updateIsPreparing (req, res) {
      const { id, isPreparing } = req.body;
    
      // Kiểm tra đầu vào
      if (!id || typeof isPreparing !== 'boolean') {
        return res.status(400).json({ error: 'Invalid input' });
      }
    
      try {
        // Cập nhật sản phẩm với ID duy nhất
        const updateResult = await Order.updateOne(
          { _id: id },
          {
            $set: {
                'statusOrder.isDelivered': false,
                'statusOrder.isCanceled': false,
                'statusOrder.isPreparing': isPreparing
            }
        }
        );
    
        if (updateResult.nModified === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        // Lấy thông tin sản phẩm đã được cập nhật
        const updatedProduct = await Order.findById(id);
    
        res.status(200).json({ message: 'isPreparing status updated', data: updatedProduct });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }

    //GET /order
    async getOrders(req, res) {
        try {
            const orders = await Order.find();
            res.status(200).json(orders);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    };
}

module.exports = new OrderController