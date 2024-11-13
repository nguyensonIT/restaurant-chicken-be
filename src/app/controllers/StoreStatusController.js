// controllers/storeStatusController.js
const StoreStatus = require('../models/StoreStatus');

class StoreStatusController {
    // Lấy trạng thái hiện tại của cửa hàng
    async getStatus  (req, res) {
      try {
        const status = await StoreStatus.findOne();
        res.json(status);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };
    
    // Cập nhật trạng thái đóng mở cửa
    async updateStatus  (req, res) {
      try {
        const { isOpen } = req.body;
        const status = await StoreStatus.findOneAndUpdate(
          {},
          { isOpen, updatedAt: Date.now() },
          { new: true, upsert: true }
        );
        res.json(status);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

}

module.exports = new StoreStatusController
