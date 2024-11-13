const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config(); // Đọc biến môi trường từ tệp .env

// Khởi tạo Firebase Admin SDK
require('./utils/cloudinary');

const route = require("./routes");
const db = require("./config/db");

// Kết nối tới DB
db.connect();

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình CORS
app.use(cors());

app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

// HTTP logger
app.use(morgan('combined'));

// Khởi tạo routes
route(app);

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
