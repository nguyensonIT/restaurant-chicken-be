const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const http = require('http')
const setupWebSocketServer = require('./websocket');

require('dotenv').config(); // Đọc biến môi trường từ tệp .env

const route = require("./routes")
const db = require("./config/db")

//connect to DB
db.connect()

const app = express()
const PORT = process.env.PORT || 3000;

// Tạo HTTP server từ ứng dụng Express
const server = http.createServer();

// Cấu hình WebSocket
setupWebSocketServer(server);

// Cấu hình CORS
app.use(cors());

app.use(express.urlencoded({ limit: '50mb',extended:true}))
app.use(express.json({ limit: '50mb'}))


//HTTP logger
app.use(morgan('combined'))


//routes init
route(app)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT} `)
})
server.listen(3000, () => {
  console.log(`Socket listening on port 3000 `)
})