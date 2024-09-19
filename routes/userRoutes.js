const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../middleware/authController");

const router = express.Router();
router.route("/signUp").post(authController.signUp);
router.route("/login").post(userController.login);
module.exports = router;
