// src/services/fileUploadService.js

const cloudinary = require('../utils/cloudinary');
const { Readable } = require('stream');
const path = require('path');

// Hàm upload ảnh lên Cloudinary
const uploadFileToCloudinary = async (file, folder = 'uploads', public_id = null) => {
  
  try {
    // Nếu có public_id (tức là ảnh cũ), chúng ta xóa ảnh cũ trước khi upload ảnh mới
    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
    }

    // Tạo tên file duy nhất từ file gốc
    const fileName = Date.now() + path.extname(file.originalname);

    // Chuyển Buffer thành stream
    const bufferStream = Readable.from(file.buffer);

    // Upload file lên Cloudinary và trả về URL
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,  // Thư mục trên Cloudinary
          public_id: fileName,  // Tên file duy nhất
          resource_type: 'auto',  // Tự động nhận diện định dạng file (ảnh, video, v.v.)
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      bufferStream.pipe(uploadStream); // Pipe Buffer vào uploadStream
    });

    // Trả về URL ảnh mới
    return uploadResult.secure_url;
  } catch (error) {
    throw new Error(`Error uploading file to Cloudinary: ${error.message}`);
  }
};
const deleteFileFromCloudinary = async (publicId)=> {
  try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted image with public_id: ${publicId}`);
  } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
  }
}

module.exports = {
  uploadFileToCloudinary,deleteFileFromCloudinary
};
