const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// LOGIN

const loginController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    errors.errors.forEach((error) => {
      throw new Error(error.msg);
    });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate("posts");
  if (!user) {
    res.status(404);
    throw new Error("No user found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  const id = user._id;
  const token = jwt.sign({id}, "secret", {expiresIn: 360000});
  res.json({ ...user._doc, token });
});

// REGISTER
const registerController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    errors.errors.forEach((error) => {
      throw new Error(error.msg);
    });
  }
  const { email, password, username, fullname } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    res.status(400);
    throw new Error("User already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  user = await User.create({
    email,
    password: hashedPassword,
    username,
    fullname,
  });
  const id = user._id;
  const token = jwt.sign({ id }, "secret", { expiresIn: 360000 });

  res.json({ ...user._doc, token });
});

// GET MY PROFILE

const getMyProfileController = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// GET ALL PROFILES

const getAllProfilesController = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .populate("posts")
      .populate("followers")
      .populate("following");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL UNFOLLOWING PROFILES

const getALlUnfollowingProfiles = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const following = user.following;
  const users = await User.find({ _id: { $nin: following, $ne: req.user.id } })
    .select("profileImage")
    .select("username")
    .select("fullname")
    .select("followers");
  res.json(users);
});

// UPDATE MY PROFILE

const updateUser = asyncHandler(async (req, res) => {
  const profileFields = { ...req.body };
    const newProfile = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    const updated = await newProfile.save();
    res.json(updated);
    console.log(updated);
});

// GET USER BY ID

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password").populate("posts");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("No user found");
  }
});

const follow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userProfile = await User.findById(id);
  const myProfile = await User.findById(req.user.id);

  if (!userProfile || !myProfile) {
    res.status(404);
    throw new Error("NO user found");
  }

  if (userProfile.followers.indexOf(req.user.id) !== -1) {
    userProfile.followers.splice(userProfile.followers.indexOf(req.user.id), 1);
    myProfile.following.splice(
      myProfile.following.indexOf(userProfile.user),
      1
    );
    await myProfile.save();
    await userProfile.save();
  } else {
    userProfile.followers.unshift(req.user.id);
    myProfile.following.unshift(userProfile._id);

    await myProfile.save();
    await userProfile.save();
  }

  res.json(userProfile.followers);
});

module.exports = {
  loginController,
  registerController,
  getMyProfileController,
  getAllProfilesController,
  getALlUnfollowingProfiles,
  updateUser,
  getUserById,
  follow,
};
