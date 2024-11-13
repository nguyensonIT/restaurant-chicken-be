const express = require('express')
const morgan = require('morgan')
const cors = require('cors');

const http = require('http');
const socketIo = require('socket.io');

require('dotenv').config(); // Đọc biến môi trường từ tệp .env

// Khởi tạo Firebase Admin SDK
require('./utils/cloudinary');

const route = require("./routes")
const db = require("./config/db")
const setupWebSocketServer = require('./websocket/websocket.js');

//connect to DB
db.connect()

const app = express()
const server = http.createServer(app); // Tạo HTTP server từ Express
const io = socketIo(server); // Gắn socket.io vào HTTP server
const PORT = process.env.PORT || 3000;


// Cấu hình CORS
app.use(cors());

app.use(express.urlencoded({ limit: '100mb',extended:true}))
app.use(express.json({ limit: '100mb'}))


//HTTP logger
app.use(morgan('combined'))


//routes init
route(app)

// Khởi tạo WebSocket server
setupWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
