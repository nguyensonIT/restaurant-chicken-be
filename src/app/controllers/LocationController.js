const Location = require("../models/Location");

class LocationController {
  async getLocation(req, res) {
    try {
      const locations = await Location.find({});
      const locationNames = locations.map((location) => location.name);
      res.json({ success: true, data: locationNames });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  }
  async updateLocation(req, res) {
    const { locations } = req.body;
    if (!Array.isArray(locations)) {
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu phải là mảng." });
    }

    try {
      // Xóa hết danh sách cũ
      await Location.deleteMany({});
      // Insert mới
      const insertData = locations.map((name) => ({ name }));
      await Location.insertMany(insertData);

      res.json({
        success: true,
        message: "Cập nhật thành công.",
        data: locations,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server Error", error: err.message });
    }
  }
}

module.exports = new LocationController();
