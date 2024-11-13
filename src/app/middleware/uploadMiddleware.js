// src/middleware/uploadMiddleware.js
const multer = require('multer');
const storage = multer.memoryStorage();  // Lưu trữ file trực tiếp trong bộ nhớ
const upload = multer({ storage: storage });

module.exports = upload;
