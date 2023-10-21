const expressAsyncHandler = require("express-async-handler");
const { check, validationResult } = require("express-validator");
const Post = require("../models/PostModel.js");

const User = require("../models/UserModel");


//Post route

const createPost = expressAsyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const post = new Post(req.body);
  const user = await User.findById(req.user.id).populate("posts");
  user.posts.unshift(post);
  post.user = req.user.id;
  const createdPost = await post.save();
  await user.save();
  res.json(createdPost);
});

//Get all posts

const getAllPosts = expressAsyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ date: -1 })
    .populate("user", ["profileImage", "username"]);
  res.json(posts);
});
//Get all posts by following

const getAllPostsByFollowing = expressAsyncHandler(async (req, res) => {
  let posts = await Post.find().populate("user").sort({date : -1});
  const user = await User.findById(req.user.id);
  const following = user.following;
  const filteredPosts = [];
  following.forEach((following) =>
    posts.map(
      (post) =>
        post.user._id.toString() === following.toString() &&
        filteredPosts.push(post)
    )
  );
  res.json(filteredPosts);
});

//Like a post

const likePost = expressAsyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("No post found");
  }
  if (
    post.likes.filter((like) => like.user.toString() === req.user.id).length > 0
  ) {
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } else {
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  }
});
// comment on a post


const comment = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { text } = req.body;
    const post = await Post.findById(id);
    const user = await User.findById(req.user.id).select("-password");
    if (!post) {
      res.status(400)
      throw new Error("No post found")
    }
    const comment = {
      username: user.username,
      profileImage: user.profileImage,
      text,
    };
    post.comments.unshift(comment);
    await post.save();
    res.json(post.comments);
});

// //Like a comment

// router.patch("/:id/comment/:commentId/like", auth, async (req, res) => {
//   const { id, commentId } = req.params;
//   try {
//     const post = await Post.findById(id);
//     let comment = post.comments.find((comment) => comment.id === commentId);
//     if (comment) {
//       const prevLike = comment.likes.find(
//         (like) => like._id.toString() === req.user.id
//       );
//       if (prevLike) {
//         comment.likes.splice(comment.likes.indexOf(req.user.id), 1);
//       } else {
//         comment.likes.unshift(req.user.id);
//       }
//     } else {
//       res.status(404).json({ message: "no comment found" });
//     }
//     await post.save();
//     res.json(comment.likes);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// //Delete a comment

// router.delete("/:id/comment/:commentId", auth, async (req, res) => {
//   const { id, commentId } = req.params;
//   try {
//     const post = await Post.findById(id);
//     let comment = post.comments.find((comment) => comment.id === commentId);
//     if (comment) {
//       comment.remove();
//     } else {
//       res.status(404).json({ message: "no comment found" });
//     }
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// //get post by id

// router.get("/:id", auth, async (req, res) => {
//   const { id } = req.params;
//   try {
//     const post = await Post.findById(id).populate("user", [
//       "profileImage",
//       "username",
//     ]);
//     if (!post) {
//       res.status(404).json({ message: "no post found" });
//     }
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Delete a post
// router.delete("/:id", auth, async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) {
//       return res.status(404).json({ msg: "No Post found" });
//     }
//     if (post.user.toString() !== req.user.id) {
//       return res.status(401).json({ msg: "User not authorized" });
//     }
//     await post.remove();
//     res.json({ msg: "Post deleted" });
//   } catch (error) {
//     console.log(error.message);
//     if (!id) {
//       return res.status(404).json({ msg: "No Post found" });
//     }
//     return res.status(500).send("Server Error");
//   }
// });

module.exports = { createPost, getAllPosts, getAllPostsByFollowing, likePost, comment };
