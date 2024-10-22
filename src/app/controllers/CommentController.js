const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

class CommentController {
  async createComment(req, res) {
    const { postId, contentCmt, userId, imageCmt, parentId,replyToUserId } = req.body;
  
    try {
      // Kiểm tra xem bài viết có tồn tại không
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Nếu parentId không được cung cấp hoặc không tồn tại, tạo bình luận mới
      if (!parentId || !(await Comment.findById(parentId))) {
        const comment = new Comment({
          postId,
          contentCmt,
          userId,
          imageCmt,
          createdAt: new Date(),
        });
  
        // Lưu bình luận vào CSDL
        await comment.save();
  
        // Thêm bình luận vào bài viết
        post.comments.push(comment._id);
        await post.save();
  
        return res.status(201).json(comment);
      }
  
      // Nếu parentId hợp lệ, tìm bình luận cha
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
  
      // Lấy thông tin người dùng từ bình luận cha
      // const replyToUserId = parentComment.userId;
  
      const replyComment = new Comment({
        postId,
        contentCmt,
        userId,
        imageCmt,
        parentId,
        replyToUserId, // Sử dụng ID của người dùng từ bình luận cha
        createdAt: new Date(),
      });
  
      // Lưu bình luận con vào CSDL
      await replyComment.save();
  
      // Thêm bình luận con vào replies của bình luận cha
      parentComment.replies.push(replyComment._id);
      await parentComment.save();
  
      return res.status(201).json(replyComment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  async getComments(req, res) {
    try {
        const postId = req.params.postId;

        // Lấy bình luận gốc và phản hồi
        const comments = await Comment.find({ postId, parentId: null })
            .populate('userId', 'name image') // Lấy thông tin người dùng bình luận
            .populate({
                path: 'replies',
                populate: [
                    { path: 'userId', select: 'name image' }, // Lấy thông tin người dùng bình luận phản hồi
                    { path: 'replyToUserId', select: 'name image' } // Lấy thông tin người dùng trả lời
                ]
            })
            .lean(); // Tối ưu hóa truy vấn

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error); // Log thông tin lỗi chi tiết
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}



}

module.exports = new CommentController();
