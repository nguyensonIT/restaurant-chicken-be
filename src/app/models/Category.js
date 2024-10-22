const mongoose = require('mongoose');
const Schema = mongoose.Schema

const Category = new Schema({
  nameCategory: { type: String, required: true },
  order: { type: Number, default: 0 }, 
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

module.exports = mongoose.model('Category', Category);
