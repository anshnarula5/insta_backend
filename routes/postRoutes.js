const express = require("express");
const { check } = require("express-validator");
const {
  createPost,
  getAllPosts,
  getAllPostsByFollowing,
  likePost,
  comment,
} = require("../controllers/postController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();



const validatePost = [check("image", "Image is required").not().isEmpty()];

const validateComment = [
  check("text", "Comment is required").trim().not().isEmpty(),
];

router.post("/", auth, validatePost, createPost);
router.get("/", auth, getAllPosts);
router.get("/following", auth, getAllPostsByFollowing);
router.put("/:id/like", auth, likePost);
router.put("/:id/comment", auth, validateComment, comment);

module.exports = router;
