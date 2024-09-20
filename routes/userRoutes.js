const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../middleware/authController");
const verifyEmailController = require("../middleware/verifyemail");

const router = express.Router();
router.route("/signUp").post(authController.signUp);
router.route("/login").post(userController.login);
router.route("/verifyEmail/:token").post(authController.verifyEmail);
module.exports = router;
