const mongoose = require('mongoose');
const Schema = mongoose.Schema

const Post = new Schema({
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Post', Post);
