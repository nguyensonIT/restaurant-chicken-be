const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  contentCmt: { type: String, required: true, minlength: 1, maxlength: 500 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  imageCmt: { type: String},
  isDeleted: { type: Boolean, default: false },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  replyToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', Comment);
