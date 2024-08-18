const categoryRouter = require('./category')
const productRouter = require('./product')
const authRouter = require('./auth')
const siteRouter = require("./site")
const errorHandler = require('../app/middleware/errorMiddleware')
     
function route(app) {
    app.use("/api/category",categoryRouter)
    app.use("/api/product",productRouter)
    app.use("/api/auth",authRouter)
    app.use("/api/",siteRouter)
    app.use(errorHandler);
}
module.exports = route
