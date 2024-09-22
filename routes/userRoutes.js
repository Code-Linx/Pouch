const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../middleware/authController');
const verifyEmailController = require('../middleware/verifyemail');

const router = express.Router();

router.post('/register', authController.signUp); // Fix this line
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/verifyEmail/:token', verifyEmailController.verifyEmail);

router.post('/forgetPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//PROTECTED ROUTES

router.patch(
  '/updateMypassword',
  authController.protect,
  authController.updatePassword
);

module.exports = router;
