const Config = require("../models/Config");
const Product = require("../models/Product");

const cloudinary = require("cloudinary").v2;

const { uploadFileToCloudinary } = require("../../services/fileUploadService");
const { getPublicIdFromUrl } = require("../../utils/getIdImageCloudinary");

class SiteController {
  //[POST] /update sale
  async updateSale(req, res) {
    const { ids, sale } = req.body;

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      typeof sale !== "number" ||
      sale < 0 ||
      sale > 100
    ) {
      return res.status(400).json({ error: "Invalid input" });
    }

    try {
      const updateResult = await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { sale: sale } },
        { multi: true }
      );

      res.status(200).json({
        message: "Sale percentage updated",
        updatedCount: updateResult.nModified,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  //[POST] /update new product
  async updateNewProduct(req, res) {
    const { ids, newProduct } = req.body;

    // Kiểm tra đầu vào
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      typeof newProduct !== "boolean"
    ) {
      return res.status(400).json({ error: "Invalid input" });
    }

    try {
      // Cập nhật các sản phẩm với ID trong danh sách
      const updateResult = await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { newProduct: newProduct } },
        { multi: true }
      );

      res.status(200).json({
        message: "New product status updated",
        updatedCount: updateResult.nModified,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  //[POST] /update hot product
  async updateHotProduct(req, res) {
    const { ids, hotProduct } = req.body;

    // Kiểm tra đầu vào
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      typeof hotProduct !== "boolean"
    ) {
      return res.status(400).json({ error: "Invalid input" });
    }

    try {
      // Cập nhật các sản phẩm với ID trong danh sách
      const updateResult = await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { hotProduct: hotProduct } },
        { multi: true }
      );

      res.status(200).json({
        message: "Hot product status updated",
        updatedCount: updateResult.nModified,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  //[PUT] /update-logo
  async updateLogo(req, res) {
    try {
      // Lấy config hiện tại (giả sử chỉ có 1 bản ghi config)
      let config = await Config.findOne();
      if (!config) {
        config = await Config.create({ logoUrl: "" }); // có thể tạo thêm các trường khác nếu muốn
      }
      if (!config) return res.status(404).json({ message: "Config not found" });

      // Kiểm tra ảnh cũ từ Cloudinary
      const oldLogoIsCloudinary =
        config.logoUrl && !config.logoUrl.startsWith("data:image");
      const oldLogoPublicId = oldLogoIsCloudinary
        ? getPublicIdFromUrl(config.logoUrl)
        : null;

      // Mặc định giữ lại logo hiện tại
      let newLogoUrl = config.logoUrl;

      // Trường hợp gửi file (upload logo mới)
      if (req.file) {
        newLogoUrl = await uploadFileToCloudinary(
          req.file,
          "uploads/logo",
          oldLogoPublicId
        );
      }
      // Trường hợp gửi base64
      else if (req.body.logoUrl && req.body.logoUrl.startsWith("data:image")) {
        const base64Data = req.body.logoUrl.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const buffer = Buffer.from(base64Data, "base64");

        const fileUpload = {
          originalname: `logo_${Date.now()}`,
          mimetype: "image/jpeg",
          buffer,
        };

        newLogoUrl = await uploadFileToCloudinary(
          fileUpload,
          "uploads/logo",
          oldLogoPublicId
        );
      }

      // Cập nhật URL logo mới
      config.logoUrl = newLogoUrl;

      const updatedConfig = await config.save();
      res.json({
        message: "Logo updated successfully",
        logoUrl: updatedConfig.logoUrl,
      });
    } catch (err) {
      console.error("Error updating logo:", err);
      res.status(500).json({ message: "Server error: " + err.message });
    }
  }

  //[PUT] /update-banner
  async updateBanner(req, res) {
    try {
      let config = await Config.findOne();
      if (!config) {
        config = await Config.create({ bannerUrls: [] });
      }

      const oldBannerUrls = config.bannerUrls || [];

      // 🔥 1. Xóa hết ảnh cũ trong Cloudinary
      const removeExtension = (filename) => filename.replace(/\.[^/.]+$/, "");

      for (const url of oldBannerUrls) {
        if (!url.startsWith("data:image")) {
          try {
            const cleanedUrl = url.replace(
              /(\.[a-zA-Z0-9]+)\.[a-zA-Z0-9]+$/,
              "$1"
            );
            const publicIdWithExt = getPublicIdFromUrl(cleanedUrl);
            const publicId = removeExtension(publicIdWithExt);

            const result = await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.warn(`❌ Không thể xóa ảnh cũ: ${url}`);
          }
        }
      }

      // 🔄 2. Xử lý upload ảnh mới
      let newBannerUrls = [];

      // Gửi từ form: req.files (multipart/form-data)
      if (req.files && req.files.length > 0) {
        for (const file of req.files.slice(0, 3)) {
          const imageUrl = await uploadFileToCloudinary(file, "uploads/banner");
          newBannerUrls.push(imageUrl);
        }
      }

      // Gửi base64: req.body.bannerUrls là mảng
      else if (
        req.body.bannerUrls &&
        Array.isArray(req.body.bannerUrls) &&
        req.body.bannerUrls.length > 0
      ) {
        const base64List = req.body.bannerUrls.slice(0, 3); // giới hạn 3 ảnh

        for (const base64 of base64List) {
          if (base64.startsWith("data:image")) {
            const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");

            const fileUpload = {
              originalname: `banner_${Date.now()}`,
              mimetype: "image/jpeg",
              buffer,
            };

            const imageUrl = await uploadFileToCloudinary(
              fileUpload,
              "uploads/banner"
            );
            newBannerUrls.push(imageUrl);
          }
        }
      }

      // 📝 3. Cập nhật lại config
      config.bannerUrls = newBannerUrls;
      const updatedConfig = await config.save();

      res.json({
        message: "Banner updated successfully",
        bannerUrls: updatedConfig.bannerUrls,
      });
    } catch (err) {
      console.error("Error updating banners:", err);
      res.status(500).json({ message: "Server error: " + err.message });
    }
  }

  //[GET] /logo
  async getConfig(req, res) {
    try {
      const config = await Config.findOne();
      if (!config) {
        return res.status(404).json({ message: "Config not found" });
      }

      res.json(config); // Trả toàn bộ bản ghi config
    } catch (err) {
      console.error("Error getting config:", err);
      res.status(500).json({ message: "Server error: " + err.message });
    }
  }
}

module.exports = new SiteController();
