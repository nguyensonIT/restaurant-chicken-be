const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  name: { type: String },
  cart: {type: Array, default:[]},
  image: { type: String, default: '' },
  roles: {type: Array ,default: ['user'] }
});

// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
UserSchema.pre('save', async function (next) {
  if (this.isModified('username') && !this.name) {
    this.name = this.username;
  }

  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// So sánh mật khẩu khi người dùng đăng nhập
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
