const Order = require("../models/Order");

class OrderController {
  //POST /order
  async createOrder(req, res) {
    const getNextOrderNumber = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const lastOrderToday = await Order.findOne({
        orderDate: { $gte: startOfDay, $lte: endOfDay },
      }).sort({ orderNumber: -1 });

      return lastOrderToday ? lastOrderToday.orderNumber + 1 : 1;
    };

    try {
      const orderNumber = await getNextOrderNumber();
      const { userOrderId, ...otherData } = req.body; // Tách userOrderId và thu thập các dữ liệu khác

      const orderData = {
        orderNumber,
        ...otherData,
      };

      // Chỉ thêm userOrder nếu userOrderId được cung cấp
      if (userOrderId) {
        orderData.userOrder = userOrderId;
      }

      const order = new Order(orderData);
      await order.save();
      res.status(201).json(order);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  //[POST] /update is delivered order
  async updateIsDelivered(req, res) {
    const { id, isDelivered } = req.body;

    // Kiểm tra đầu vào
    if (!id || typeof isDelivered !== "boolean") {
      return res.status(400).json({ error: "Invalid input" });
    }

    try {
      // Cập nhật sản phẩm với ID duy nhất
      const updateResult = await Order.updateOne(
        { _id: id },
        {
          $set: {
            "statusOrder.isDelivered": isDelivered,
            "statusOrder.isCanceled": false,
            "statusOrder.isPreparing": false,
          },
        }
      );

      if (updateResult.nModified === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Lấy thông tin sản phẩm đã được cập nhật
      const updatedProduct = await Order.findById(id);

      res
        .status(200)
        .json({ message: "isDelivered status updated", data: updatedProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  //[POST] /update is Cancel order
  async updateIsCanceled(req, res) {
    const { id, isCanceled } = req.body;

    // Kiểm tra đầu vào
    if (!id || typeof isCanceled !== "boolean") {
      return res.status(400).json({ error: "Invalid input" });
    }

    try {
      // Cập nhật sản phẩm với ID duy nhất
      const updateResult = await Order.updateOne(
        { _id: id },
        {
          $set: {
            "statusOrder.isDelivered": false,
            "statusOrder.isCanceled": isCanceled,
            "statusOrder.isPreparing": false,
          },
        }
      );

      if (updateResult.nModified === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Lấy thông tin sản phẩm đã được cập nhật
      const updatedProduct = await Order.findById(id);

      res
        .status(200)
        .json({ message: "isCanceled status updated", data: updatedProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  async cancelOrderByCustomer(req, res) {
    const { id } = req.body;
    // Kiểm tra đầu vào
    if (!id) {
      return res.status(400).json({ error: "Invalid input" });
    }

    try {
      // Lấy đơn hàng để kiểm tra thời gian đặt hàng
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Kiểm tra nếu đã quá 3 phút kể từ khi đặt hàng
      const orderDate = new Date(order.orderDate);
      const currentTime = new Date();
      const timeDifference = (currentTime - orderDate) / 60000; // Tính khoảng cách thời gian tính bằng phút

      if (timeDifference > 3) {
        return res.status(400).json({
          message:
            "Order can only be canceled within 3 minutes of placing the order",
        });
      }

      // Cập nhật trạng thái hủy đơn hàng
      const updateResult = await Order.updateOne(
        { _id: id },
        {
          $set: {
            "statusOrder.isDelivered": false,
            "statusOrder.isCanceled": true,
            "statusOrder.isPreparing": false,
          },
        }
      );

      if (updateResult.nModified === 0) {
        return res.status(404).json({ message: "Failed to cancel order" });
      }

      // Lấy thông tin đơn hàng đã được cập nhật
      const updatedOrder = await Order.findById(id);

      res
        .status(200)
        .json({ message: "Order has been canceled", data: updatedOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  //[POST] /update is Preparing order
  async updateIsPreparing(req, res) {
    const { id, isPreparing } = req.body;

    // Kiểm tra đầu vào
    if (!id || typeof isPreparing !== "boolean") {
      return res.status(400).json({ error: "Invalid input" });
    }

    try {
      // Cập nhật sản phẩm với ID duy nhất
      const updateResult = await Order.updateOne(
        { _id: id },
        {
          $set: {
            "statusOrder.isDelivered": false,
            "statusOrder.isCanceled": false,
            "statusOrder.isPreparing": isPreparing,
          },
        }
      );

      if (updateResult.nModified === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Lấy thông tin sản phẩm đã được cập nhật
      const updatedProduct = await Order.findById(id);

      res
        .status(200)
        .json({ message: "isPreparing status updated", data: updatedProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  //GET /order
  async getOrders(req, res) {
    try {
      const orders = await Order.find().sort({ orderDate: -1 });
      res.status(200).json(orders);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // GET /order/:userOrderId
  async getOrdersByUser(req, res) {
    const { userOrderId } = req.params; // Lấy userOrderId từ URL params

    try {
      // Tìm và sắp xếp đơn hàng theo userOrderId, sắp xếp theo orderDate từ mới nhất đến cũ nhất
      const orders = await Order.find({ userOrder: userOrderId }).sort({
        orderDate: -1,
      }); // -1 là sắp xếp giảm dần (mới nhất đến cũ nhất)

      // Trả về mảng đơn hàng, nếu không có đơn hàng thì trả về mảng rỗng
      res
        .status(200)
        .json({ message: "Orders fetched successfully.", data: orders });
    } catch (err) {
      console.error(err); // In lỗi ra console để debug
      res.status(500).json({
        message: "An error occurred while fetching orders.",
        error: err.message,
      });
    }
  }

  // GET /order-by-sub/:subId
  async getOrdersBySubId(req, res) {
    const { subId } = req.params; // Lấy subId từ URL params

    try {
      // Tìm và sắp xếp đơn hàng theo subId, sắp xếp theo orderDate từ mới nhất đến cũ nhất
      const orders = await Order.find({ subId });

      // Trả về mảng đơn hàng, nếu không có đơn hàng thì trả về mảng rỗng
      res
        .status(200)
        .json({ message: "Orders fetched successfully.", data: orders });
    } catch (err) {
      console.error(err); // In lỗi ra console để debug
      res.status(500).json({
        message: "An error occurred while fetching orders.",
        error: err.message,
      });
    }
  }
}

module.exports = new OrderController();
