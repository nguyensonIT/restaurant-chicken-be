const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController{
    //[POST] /auth/register
    async registerUser(req, res) {
        const { username, password, name } = req.body;
        
        try {
          const user = new User({ username, password, name });
          await user.save();
          res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      };

    //[POST] /auth/login
    async loginUser(req, res) {
        const { username, password } = req.body;
      
        try {
          const user = await User.findOne({ username });
          if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      
          const isMatch = await user.matchPassword(password);
          if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

          const payload = {
            id: user._id,
            username: user.username,
            name: user.name,
            cart: user.cart,
            image: user.image,
            roles: user.roles   // Thêm thông tin quyền hạn (roles) nếu có
        };
      
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
          res.json({ token });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      };

    //[PUT] /auth/update-name
    async updateName(req, res) {
      const userId = req.user.id
      const { name } = req.body;

      try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name;
        await user.save();
        
        res.json({ message: 'Name updated successfully', user });
      } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
      }
    }

    //[PUT] /auth/change-password
    async changePassword(req, res) {
      const userId = req.user.id; // Lấy userId từ middleware xác thực
      const { currentPassword, newPassword } = req.body;

      try {
        // Tìm người dùng
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

        user.password = newPassword;
        
        // Lưu thay đổi
        await user.save();

        res.json({ message: 'Password changed successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
      }
    }

}

module.exports = new AuthController