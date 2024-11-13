const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StoreStatus  = new Schema({
  isOpen: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StoreStatus', StoreStatus);
