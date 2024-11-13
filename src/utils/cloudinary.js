// src/utils/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Cấu hình với thông tin API Key và API Secret từ Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Lấy từ Cloudinary Dashboard
  api_key: process.env.CLOUDINARY_API_KEY, // Lấy từ Cloudinary Dashboard
  api_secret: process.env.CLOUDINARY_API_SECRET, // Lấy từ Cloudinary Dashboard
});

module.exports = cloudinary;
