const { uploadFileToCloudinary } = require("../../services/fileUploadService");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const { getPublicIdFromUrl } = require("../../utils/getIdImageCloudinary");

class AuthController {
  //[POST] /auth/register
  async registerUser(req, res) {
    const { username, password, name } = req.body;

    // Kiểm tra xem tất cả các trường có tồn tại hay không
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Tất cả các trường đều là bắt buộc." });
    }

    try {
      // Kiểm tra xem người dùng đã tồn tại chưa
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          message: "Tài khoản này đã được đăng ký. Vui lòng thử lại!",
        });
      }

      // Tạo người dùng mới
      const user = new User({ username, password, name });
      await user.save();

      // Tạo token
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "20h" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token: token, // Trả về token
      });
    } catch (error) {
      console.error(error); // Ghi log lỗi để phục vụ việc gỡ lỗi
      res.status(500).json({
        message: "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.",
      });
    }
  }

  //[POST] /auth/login
  async loginUser(req, res) {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });
      if (!user)
        return res
          .status(401)
          .json({ status: 401, message: "Invalid credentials" });

      const isMatch = await user.matchPassword(password);
      if (!isMatch)
        return res
          .status(401)
          .json({ status: 401, message: "Invalid credentials" });

      const payload = {
        id: user._id,
        username: user.username,
        name: user.name,
        image: user.image,
        email: user.email,
        roles: user.roles,
        address: user.address,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "20h",
      });
      res.status(201).json({
        status: 201,
        message: "Login successful",
        token: token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          image: user.image,
          email: user.email,
          roles: user.roles,
          address: user.address,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  //[PUT] /auth/update-profile
  async updateProfile(req, res) {
    const userId = req.user.id; // Lấy ID người dùng từ token hoặc session
    const { name, image, address, email, phoneNumber } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Lấy public_id của ảnh cũ (nếu có)
      const oldImagePublicId = user.image
        ? getPublicIdFromUrl(user.image)
        : null;

      // Xử lý trường image nếu có
      if (req.file) {
        // Nếu người dùng upload file ảnh từ form
        const imageUrl = await uploadFileToCloudinary(
          req.file,
          "uploads/avatar",
          oldImagePublicId
        ); // Upload ảnh lên Cloudinary và xóa ảnh cũ
        user.image = imageUrl; // Cập nhật trường image với URL ảnh từ Cloudinary
      } else if (image) {
        // Nếu image là base64
        if (image.startsWith("data:image")) {
          const base64Data = image.replace(/^data:image\/\w+;base64,/, ""); // Loại bỏ tiền tố
          const buffer = Buffer.from(base64Data, "base64"); // Chuyển base64 thành Buffer

          const fileName = `profile_${userId}_${Date.now()}.jpeg`; // Tạo tên file duy nhất
          const fileUpload = {
            originalname: fileName,
            mimetype: "image/jpeg",
            buffer, // Sử dụng buffer thay vì file path
          };

          const imageUrl = await uploadFileToCloudinary(
            fileUpload,
            "uploads/avatar",
            oldImagePublicId
          ); // Upload ảnh mới và xóa ảnh cũ
          user.image = imageUrl; // Cập nhật trường image với URL ảnh từ Cloudinary
        } else {
          return res.status(400).json({ message: "Invalid image data" });
        }
      }

      // Cập nhật các trường khác của người dùng
      if (name) user.name = name;
      if (address) user.address = address;
      if (email) user.email = email;
      if (phoneNumber) user.phoneNumber = phoneNumber;

      // Lưu đối tượng người dùng sau khi cập nhật
      await user.save();

      // Tạo token mới
      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          image: user.image, // Đảm bảo image được đưa vào token
          address: user.address,
          email: user.email,
          phoneNumber: user.phoneNumber,
          roles: user.roles,
        },
        process.env.JWT_SECRET,
        { expiresIn: "20h" }
      );

      // Trả về kết quả thành công với thông tin người dùng và token
      res.status(200).json({
        message: "Profile updated successfully",
        token,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error: " + error.message });
    }
  }

  //[PUT] /auth/change-password
  async changePassword(req, res) {
    const userId = req.user.id; // Lấy userId từ middleware xác thực
    const { currentPassword, newPassword } = req.body;

    try {
      // Tìm người dùng
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Kiểm tra mật khẩu hiện tại
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch)
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });

      user.password = newPassword;

      // Lưu thay đổi
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error: " + error.message });
    }
  }

  //[GET] /auth/users
  async getAllUsers(req, res) {
    try {
      const users = await User.find().select("-password"); // Ẩn trường password
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách người dùng",
        error: error.message,
      });
    }
  }

  //[DELETE] /auth/users/:id
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Không cho phép admin xoá chính mình
      if (req.user.id === id) {
        return res.status(400).json({
          success: false,
          message: "Bạn không thể tự xoá chính mình",
        });
      }

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.status(200).json({
        success: true,
        message: "Xoá người dùng thành công",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server khi xoá người dùng",
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();
