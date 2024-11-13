const getPublicIdFromUrl = (url) => {
    const regex = /https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/v\d+\/(.*?)\.[a-zA-Z0-9]+$/;
    const matches = url.match(regex);
  
    if (matches && matches[1]) {
      return matches[1]; // Trả về phần public_id
    } else {
      throw new Error('Invalid Cloudinary URL format');
    }
  };
  
  module.exports = {
    getPublicIdFromUrl,
  };