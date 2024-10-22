const mongoose = require('mongoose');
const Schema = mongoose.Schema

const Product = new Schema({
  imgProduct: { type: String },
  nameProduct: { type: String, required: true },
  priceProduct: { type: Number, required: true },
  descProduct: { type: String },
  isActive: { type: Boolean, default: true },
  sale: { type: Number, default: 0 },
  newProduct: { type: Boolean, default: false },
  hotProduct: { type: Boolean, default: false },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
});

module.exports = mongoose.model('Product', Product);
