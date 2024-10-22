const express = require('express');
const router = express.Router();

const protect = require('../app/middleware/authMiddleware')
const postController = require('../app/controllers/PostController');

router.get('/', postController.getPosts);
router.post('/:id/like-post',protect, postController.likePost);
router.post('/',protect, postController.createPost);
router.delete('/delete',protect, postController.deletePost);

module.exports = router;