const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Location = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
});

module.exports = mongoose.model("Location", Location);
