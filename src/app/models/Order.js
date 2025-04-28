const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Order = new Schema({
  orderNumber: { type: String, required: true, unique: true }, // orderNumber là chuỗi
  addressCustomers: { type: String, required: true },
  nameCustomers: { type: String, required: true },
  note: { type: String, default: "" },
  phoneCustomers: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  totalBill: { type: Number, required: true },
  subTotal: { type: Number, required: true },
  priceSaleProduct: { type: Number, required: true },
  subId: { type: String, default: "" },
  statusOrder: {
    isDelivered: { type: Boolean, default: false },
    isCanceled: { type: Boolean, default: false },
    isPreparing: { type: Boolean, default: true },
  },
  data: [
    {
      currentPriceProduct: { type: Number, required: true },
      idProduct: { type: String, required: true },
      imgProduct: { type: String, default: "" },
      nameProduct: { type: String, required: true },
      note: { type: String, default: "" },
      priceProduct: { type: Number, required: true },
      quantity: { type: Number, required: true },
      sale: { type: Number, default: 0 },
    },
  ],
  userOrder: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Order", Order);
