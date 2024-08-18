const express = require('express')
const morgan = require('morgan')

require('dotenv').config(); // Đọc biến môi trường từ tệp .env

const route = require("./routes")
const db = require("./config/db")

//connect to DB
db.connect()

const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended:true}))
app.use(express.json())

//HTTP logger
app.use(morgan('combined'))


//routes init
route(app)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT} `)
})