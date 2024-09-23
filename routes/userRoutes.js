const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../middleware/authController');
const verifyEmailController = require('../middleware/verifyemail');
const budgetController = require('../controllers/budgetController');
const dashboardController = require('../controllers/dashboardController');
const categoryController = require('../controllers/categoryController');
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

router.get(
  '/dashboard',
  authController.protect,
  dashboardController.getDashboard
);
router.post(
  '/addbudgets',
  authController.protect,
  budgetController.createBudget
);

router.post(
  '/addCategory',
  authController.protect,
  categoryController.createCategory
); // Create category

router.get('/me', authController.protect, userController.getMe);

module.exports = router;
