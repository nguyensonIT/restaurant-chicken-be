const express = require('express');
const router = express.Router();

const protect = require('../app/middleware/authMiddleware')
const commentController = require('../app/controllers/CommentController');

router.get('/:postId', commentController.getComments);
router.post('/',protect, commentController.createComment);

module.exports = router;