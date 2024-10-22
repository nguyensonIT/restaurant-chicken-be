const Post = require('../models/Post');

class PostController {

      async createPost (req, res) {
        try {
          const lastPost = await Post.findOne().sort({ order: -1 });
          const post = new Post({
            content: req.body.content,
            userId: req.body.userId,
            images: req.body.images,
            order: lastPost ? lastPost.order + 1 : 1
          });
          await post.save();
          res.status(201).json(post);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      };

      async getPosts (req, res) {
        try {
          const posts = await Post.find()
            .populate('comments')
            .populate('userId', 'name image')
            .populate('likedBy', 'name image')
            .sort({ order: 1 });
          res.status(200).json(posts);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      };

      async deletePost (req, res) {
        try {
          const postId = req.params.id;
          const postToDelete = await Post.findById(postId);
          if (!postToDelete) return res.status(404).json({ error: 'Post not found' });
      
          await Post.findByIdAndDelete(postId);
          await Post.updateMany({ order: { $gt: postToDelete.order } }, { $inc: { order: -1 } });
      
          res.status(204).send();
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      };

      async likePost(req, res) {
        try {
          const postId = req.params.id; // ID của bài viết
          const userId = req.body.userId; // ID của người dùng
      
          // Tìm bài viết
          const post = await Post.findById(postId);
      
          if (!post) {
            return res.status(404).json({ error: 'Post not found' });
          }
      
          // Kiểm tra xem người dùng đã thích bài viết chưa
          if (post.likedBy.includes(userId)) {
            // Nếu đã thích, xóa ID người dùng khỏi mảng likedBy
            post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
          } else {
            // Nếu chưa thích, thêm ID người dùng vào mảng likedBy
            post.likedBy.push(userId);
          }
      
          await post.save(); // Lưu lại bài viết
          res.status(200).json(post); // Trả về bài viết đã cập nhật
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      }
      

}

module.exports = new PostController






