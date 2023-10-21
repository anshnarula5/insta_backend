const express = require("express");
const { check } = require("express-validator");
const auth = require("../middlewares/authMiddleware");
const {
  registerController,
  loginController,
  getMyProfileController,
  getAllProfilesController,
  updateUser,
  getUserById,
  follow,
  getALlUnfollowingProfiles
} = require("../controllers/userController");

const router = express.Router();

const registerValidator = [
  check("email", "Invalid email").isEmail(),
  check("fullname", "Please enter your full name").trim().not().isEmpty(),
  check("username", "Username should not contain any spaces")
    .not()
    .isEmpty()
    .custom((value) => !/\s/.test(value)),
  check("password", "Password should be of atleast 6 characters")
    .trim()
    .isLength({
      min: 6,
    }),
];

const loginValidator = [
  check("email", "Invalid email").isEmail(),
  check("password", "Password should be of atleast 6 characters")
    .trim()
    .isLength({
      min: 6,
    }),
];

const validateProfile = [
  check("username", "Username is required").not().isEmpty(),
  check("fullname", "Name is required").not().isEmpty(),
];


router.post("/", registerValidator, registerController);
router.put("/", auth, validateProfile, updateUser);
router.get("/me/profile", auth, getMyProfileController);
router.get("/", auth, getAllProfilesController);
router.get("/unfollowing", auth, getALlUnfollowingProfiles);
router.post("/login", loginValidator, loginController);
router.get("/:id", auth, getUserById);
router.put("/:id/follow", auth, follow);


module.exports = router;
