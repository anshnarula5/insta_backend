const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2018/11/13/21/43/instagram-3814049_1280.png",
  },
  website: {
    type: String,
  },
  bio: {
    type: String,
  },
  gender: {
    type: String,
  },
  email: {
    type: String,
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  saves: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
