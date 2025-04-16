const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Config = new Schema(
  {
    logoUrl: {
      type: String,
      default: "",
    },
    bannerUrls: {
      type: [String], // Mảng chứa URL ảnh banner
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Config", Config);
